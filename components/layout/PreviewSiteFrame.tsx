"use client";

import { createContext, useContext, useEffect, useState, Suspense, type ReactNode } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import RegionalLink from "./RegionalLink";
import { MapPinned, UserRound, Sprout, Menu, FileText, MessagesSquare, LogOut, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { COUNTRIES, COUNTRY_CODES_ALPHABETICAL, displayCountryName, isCountryCode, resolveCountry } from "@/data/countries";
import { useRegionalCountry } from "@/lib/i18n/useRegionalCountry";
import "@/app/v3/v3.css";
import "@/app/v3/v3-marketplace.css";
import "@/styles/v3-integrated-site.css";

const SharedPreviewChrome = createContext(false);
export function useSharedPreviewChrome() { return useContext(SharedPreviewChrome); }

function Frame({ children, root }: { children: ReactNode; root: boolean }) {
 const pathname = usePathname();
 const router = useRouter();
 const [signedIn,setSignedIn]=useState(false);
 const [signingOut,setSigningOut]=useState(false);
 const [sessionError,setSessionError]=useState(false);
 useEffect(()=>{
  let active=true;
  const client=createClient();
  void client.auth.getUser().then(({data})=>{if(active)setSignedIn(Boolean(data.user));}).catch(()=>{});
  const {data}=client.auth.onAuthStateChange((_event,session)=>{if(active)setSignedIn(Boolean(session?.user));});
  return ()=>{active=false;data.subscription.unsubscribe();};
 },[]);
 const params = useSearchParams();
 const saved = useRegionalCountry();
 const country = resolveCountry(params.get("pais"),saved);
 const t = (es:string,pt:string,en:string) => country === "BR" ? pt : country === "US" ? en : es;
 function changeCountry(value:string){
  if(!isCountryCode(value))return;
  const next=new URLSearchParams(params.toString());next.set("pais",value);
  for(const key of ["provincia","departamento","localidad","zona","north","south","east","west","page"])next.delete(key);
  let destination=pathname;
  if(/\/[0-9a-f-]{36}$/i.test(pathname)){destination="/v3";next.delete("origen");next.set("tipo",pathname.includes("servicio")?"servicio":"campo");}
  document.cookie=`rentocampo_country=${value}; path=/; max-age=31536000; SameSite=Lax`;
  try{localStorage.setItem("rentocampo_country",value);}catch{/* Optional persistence. */}
  router.push(`${destination}?${next}`);
 }
 async function signOut(){
  setSigningOut(true);setSessionError(false);
  try{const {error}=await createClient().auth.signOut();if(error)throw error;router.replace(`/v3?pais=${country}`);router.refresh();}
  catch{setSessionError(true);}finally{setSigningOut(false);}
 }
 const Content = root ? "div" : "main";
 return <div className={`v3-shell ${root ? "v3-integrated" : ""}`}>
  <a className="v3-skip-link" href="#site-content">{t("Saltar al contenido","Pular para o conteúdo","Skip to content")}</a>
  <header className="v3-header"><RegionalLink href="/v3" className="v3-brand"><Image src="/lite-logo.svg" alt="" width={50} height={50} className="v3-shield-logo"/><span>Rento<span className="v3-brand-bold">Campo</span></span></RegionalLink>
   <nav aria-label={t("Navegación principal","Navegação principal","Main navigation")}><RegionalLink href="/v3?tipo=campo">{t("Campos","Terras","Farmland")}</RegionalLink><RegionalLink href="/v3?tipo=servicio">{t("Servicios rurales","Serviços rurais","Rural services")}</RegionalLink></nav>
   <details className="v3-mobile-nav" key={`${pathname}?${params}`}><summary aria-label={t("Abrir navegación","Abrir navegação","Open navigation")}><Menu size={23}/></summary><nav aria-label={t("Navegación móvil","Navegação móvel","Mobile navigation")}><RegionalLink href="/v3">{t("Inicio","Início","Home")}</RegionalLink><RegionalLink href="/v3?tipo=campo">{t("Campos","Terras","Farmland")}</RegionalLink><RegionalLink href="/v3?tipo=servicio">{t("Servicios rurales","Serviços rurais","Rural services")}</RegionalLink><RegionalLink href="/v3/mi-rentocampo">{t("Mi cuenta","Minha conta","My account")}</RegionalLink>{signedIn && <button type="button" className="v3-mobile-signout" onClick={signOut} disabled={signingOut}>{t("Salir","Sair","Log out")}</button>}</nav></details>
   <div className="v3-header-actions">
    <label className="v3-header-country"><span>{t("PAÍS","PAÍS","COUNTRY")}</span><span className="v3-country-picker"><select value={country} onChange={event=>changeCountry(event.target.value)} aria-label={t("Seleccionar país","Selecionar país","Select country")}>{COUNTRY_CODES_ALPHABETICAL.map(code=><option value={code} key={code}>{COUNTRIES[code].flag} {code} · {displayCountryName(code,country)}</option>)}</select><span className="v3-country-value" aria-hidden="true">{COUNTRIES[country].flag} {country}<ChevronDown size={16}/></span></span></label>
    {signedIn && <RegionalLink href="/mensajes" className="v3-header-messages"><MessagesSquare size={23}/><span className="sr-only">{t("Mensajes","Mensagens","Messages")}</span></RegionalLink>}
    <RegionalLink href={signedIn?"/v3/mi-rentocampo":"/login"} className="v3-account"><UserRound size={20}/><span>{signedIn?t("Mi cuenta","Minha conta","My account"):t("Ingresar","Entrar","Sign in")}</span></RegionalLink>
    {signedIn && <button type="button" className="v3-header-signout" onClick={signOut} disabled={signingOut}><LogOut size={18}/>{t("Salir","Sair","Log out")}</button>}
   </div>
  </header>
  {sessionError && <p role="alert" className="v3-session-error">{t("No pudimos cerrar la sesión. Intentá nuevamente.","Não foi possível sair. Tente novamente.","Could not sign out. Please try again.")}</p>}
  <Content id="site-content" className="v3-site-content">{root ? <SharedPreviewChrome.Provider value={true}>{children}</SharedPreviewChrome.Provider> : children}</Content>
  <footer className="v3-footer"><div><RegionalLink href="/v3" className="v3-footer-brand">RentoCampo</RegionalLink><p>{t("El campo. Sin vueltas.","O campo. Sem complicações.","The countryside. Made simple.")}</p></div><nav className="v3-footer-explore" aria-label={t("Explorar RentoCampo","Explorar RentoCampo","Explore RentoCampo")}><RegionalLink href="/v3/campos"><MapPinned size={17}/>{t("Campos","Terras","Farmland")}</RegionalLink><RegionalLink href="/v3/servicios"><Sprout size={17}/>{t("Servicios","Serviços","Services")}</RegionalLink><RegionalLink href="/login">{t("Ingresar","Entrar","Sign in")}</RegionalLink><RegionalLink href="/register">{t("Crear cuenta","Criar conta","Create account")}</RegionalLink></nav><nav className="v3-footer-legal" aria-label={t("Información legal","Informações legais","Legal information")}><RegionalLink href="/terminos-y-condiciones"><FileText size={17}/>{t("Términos y condiciones","Termos e condições","Terms and conditions")}</RegionalLink><span>{t("Vista previa · No publicada en PROD","Prévia · Não publicada em PROD","Preview · Not published to production")}</span></nav></footer>
 </div>;
}

export default function PreviewSiteFrame({ children, root = false }: { children: ReactNode; root?: boolean }) {
 const shared = useSharedPreviewChrome();
 if (shared && !root) return <main>{children}</main>;
 return <Suspense fallback={<div>{children}</div>}><Frame root={root}>{children}</Frame></Suspense>;
}
