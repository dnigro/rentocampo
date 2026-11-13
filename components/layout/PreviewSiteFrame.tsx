"use client";

import { useEffect, useRef, useState, Suspense, type ReactNode } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { SharedPreviewChrome, useSharedPreviewChrome } from "./PreviewChromeContext";
import { SiteFooter } from "./Footer";
import Image from "next/image";
import RegionalLink from "./RegionalLink";
import { UserRound, Menu, MessagesSquare, LogOut, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { COUNTRY_CODES_ALPHABETICAL, displayCountryName, isCountryCode, resolveCountry } from "@/data/countries";
import { useRegionalCountry, persistRegionalCountry } from "@/lib/i18n/useRegionalCountry";
import "@/app/v3/v3.css";
import "@/app/v3/v3-marketplace.css";
import "@/styles/v3-integrated-site.css";
import "@/styles/v3-publication-forms.css";
import "@/styles/v3-account-sections.css";

export {useSharedPreviewChrome} from "./PreviewChromeContext";

function Frame({ children, root }: { children: ReactNode; root: boolean }) {
 const pathname = usePathname();
 const router = useRouter();
 const countryMenuRef=useRef<HTMLDetailsElement>(null);
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
  if(countryMenuRef.current)countryMenuRef.current.open=false;
  const next=new URLSearchParams(params.toString());next.set("pais",value);
  for(const key of ["provincia","departamento","localidad","zona","north","south","east","west","page"])next.delete(key);
  let destination=pathname;
  if(/\/[0-9a-f-]{36}$/i.test(pathname)){destination="/v3";next.delete("origen");next.set("tipo",pathname.includes("servicio")?"servicio":"campo");}
  persistRegionalCountry(value);
  router.push(`${destination}?${next}`);
 }
 async function signOut(){
  setSigningOut(true);setSessionError(false);
  try{const {error}=await createClient().auth.signOut();if(error)throw error;router.replace(`/v3?pais=${country}`);router.refresh();}
  catch{setSessionError(true);}finally{setSigningOut(false);}
 }
 const Content = root ? "div" : "main";
 return <div className="v3-shell v3-integrated">
  <a className="v3-skip-link" href="#site-content">{t("Saltar al contenido","Pular para o conteúdo","Skip to content")}</a>
  <header className="v3-header"><RegionalLink href="/v3" className="v3-brand"><Image src="/lite-logo.svg" alt="" width={50} height={50} className="v3-shield-logo"/><span>Rento<span className="v3-brand-bold">Campo</span></span></RegionalLink>
   <details className="v3-mobile-nav" key={`${pathname}?${params}`}><summary aria-label={t("Abrir navegación","Abrir navegação","Open navigation")}><Menu size={23}/></summary><nav aria-label={t("Navegación móvil","Navegação móvel","Mobile navigation")}><RegionalLink href="/v3">{t("Inicio","Início","Home")}</RegionalLink><RegionalLink href="/v3/mi-rentocampo">{t("Mi cuenta","Minha conta","My account")}</RegionalLink>{signedIn && <button type="button" className="v3-mobile-signout" onClick={signOut} disabled={signingOut}>{t("Salir","Sair","Log out")}</button>}</nav></details>
   <div className="v3-header-actions">
    <div className="v3-header-country"><span>{t("PAÍS","PAÍS","COUNTRY")}</span>
     <details ref={countryMenuRef} className="v3-country-menu" onKeyDown={event=>{if(event.key==="Escape"){event.preventDefault();countryMenuRef.current?.removeAttribute("open");countryMenuRef.current?.querySelector("summary")?.focus();}}}>
      <summary aria-label={t("Seleccionar país","Selecionar país","Select country")}><Image src={`/flags/${country.toLowerCase()}.svg`} alt="" width={24} height={18}/><strong>{country}</strong><ChevronDown size={16}/></summary>
      <div className="v3-country-options" role="group" aria-label={t("Países","Países","Countries")}>{COUNTRY_CODES_ALPHABETICAL.map(code=><button type="button" key={code} aria-pressed={code===country} onClick={()=>changeCountry(code)}><Image src={`/flags/${code.toLowerCase()}.svg`} alt="" width={24} height={18}/><strong>{code}</strong><span>{displayCountryName(code,country)}</span></button>)}</div>
     </details>
    </div>
    {signedIn && <RegionalLink href="/mensajes" className="v3-header-messages"><MessagesSquare size={23}/><span className="sr-only">{t("Mensajes","Mensagens","Messages")}</span></RegionalLink>}
    <RegionalLink href={signedIn?"/v3/mi-rentocampo":"/login"} className="v3-account"><UserRound size={20}/><span>{signedIn?t("Mi cuenta","Minha conta","My account"):t("Ingresar","Entrar","Sign in")}</span></RegionalLink>
    {signedIn && <button type="button" className="v3-header-signout" onClick={signOut} disabled={signingOut}><LogOut size={18}/>{t("Salir","Sair","Log out")}</button>}
   </div>
  </header>
  {sessionError && <p role="alert" className="v3-session-error">{t("No pudimos cerrar la sesión. Intentá nuevamente.","Não foi possível sair. Tente novamente.","Could not sign out. Please try again.")}</p>}
  <Content id="site-content" className="v3-site-content">{root ? <SharedPreviewChrome.Provider value={true}>{children}</SharedPreviewChrome.Provider> : children}</Content>
  <SiteFooter countryOverride={country} preview />
 </div>;
}

export default function PreviewSiteFrame({ children, root = false }: { children: ReactNode; root?: boolean }) {
 const shared = useSharedPreviewChrome();
 if (shared && !root) return <main>{children}</main>;
 return <Suspense fallback={<div>{children}</div>}><Frame root={root}>{children}</Frame></Suspense>;
}
