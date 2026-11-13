"use client";

import { createContext, useContext, Suspense, type ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";
import RegionalLink from "./RegionalLink";
import { MapPinned, UserRound, Sprout, Menu, FileText } from "lucide-react";
import { resolveCountry } from "@/data/countries";
import { useRegionalCountry } from "@/lib/i18n/useRegionalCountry";
import "@/app/v3/v3.css";
import "@/app/v3/v3-marketplace.css";
import "@/styles/v3-integrated-site.css";

const SharedPreviewChrome = createContext(false);
export function useSharedPreviewChrome() { return useContext(SharedPreviewChrome); }

function Frame({ children, root }: { children: ReactNode; root: boolean }) {
 const pathname = usePathname();
 const params = useSearchParams();
 const saved = useRegionalCountry();
 const country = resolveCountry(params.get("pais"),saved);
 const t = (es:string,pt:string,en:string) => country === "BR" ? pt : country === "US" ? en : es;
 const Content = root ? "div" : "main";
 return <div className={`v3-shell ${root ? "v3-integrated" : ""}`}>
  <a className="v3-skip-link" href="#site-content">{t("Saltar al contenido","Pular para o conteúdo","Skip to content")}</a>
  <header className="v3-header"><RegionalLink href="/v3" className="v3-brand"><Image src="/icon-512.png" alt="" width={50} height={50} className="v3-shield-logo"/><span>Rento<span className="v3-brand-bold">Campo</span></span></RegionalLink>
   <nav aria-label={t("Navegación principal","Navegação principal","Main navigation")}><RegionalLink href="/v3">{t("Explorar","Explorar","Explore")}</RegionalLink><RegionalLink href="/v3?tipo=campo">{t("Campos","Terras","Farmland")}</RegionalLink><RegionalLink href="/v3?tipo=servicio">{t("Servicios rurales","Serviços rurais","Rural services")}</RegionalLink><RegionalLink href="/v3/mi-rentocampo">{t("Mi RentoCampo","Meu RentoCampo","My RentoCampo")}</RegionalLink><RegionalLink href="/v3#como-funciona">{t("Cómo funciona","Como funciona","How it works")}</RegionalLink></nav>
   <details className="v3-mobile-nav" key={`${pathname}?${params}`}><summary aria-label={t("Abrir navegación","Abrir navegação","Open navigation")}><Menu size={23}/></summary><nav aria-label={t("Navegación móvil","Navegação móvel","Mobile navigation")}><RegionalLink href="/v3">{t("Inicio","Início","Home")}</RegionalLink><RegionalLink href="/v3?tipo=campo">{t("Campos","Terras","Farmland")}</RegionalLink><RegionalLink href="/v3?tipo=servicio">{t("Servicios rurales","Serviços rurais","Rural services")}</RegionalLink><RegionalLink href="/v3/mi-rentocampo">{t("Mi cuenta","Minha conta","My account")}</RegionalLink></nav></details>
   <div className="v3-header-actions"><RegionalLink href="/v3/mi-rentocampo" className="v3-account"><UserRound size={20}/><span>{t("Mi cuenta","Minha conta","My account")}</span></RegionalLink></div>
  </header>
  <Content id="site-content" className="v3-site-content">{root ? <SharedPreviewChrome.Provider value={true}>{children}</SharedPreviewChrome.Provider> : children}</Content>
  <footer className="v3-footer"><div><RegionalLink href="/v3" className="v3-footer-brand">RentoCampo</RegionalLink><p>{t("El campo. Sin vueltas.","O campo. Sem complicações.","The countryside. Made simple.")}</p></div><nav className="v3-footer-explore" aria-label={t("Explorar RentoCampo","Explorar RentoCampo","Explore RentoCampo")}><RegionalLink href="/v3/campos"><MapPinned size={17}/>{t("Campos","Terras","Farmland")}</RegionalLink><RegionalLink href="/v3/servicios"><Sprout size={17}/>{t("Servicios","Serviços","Services")}</RegionalLink><RegionalLink href="/login">{t("Ingresar","Entrar","Sign in")}</RegionalLink><RegionalLink href="/register">{t("Crear cuenta","Criar conta","Create account")}</RegionalLink></nav><nav className="v3-footer-legal" aria-label={t("Información legal","Informações legais","Legal information")}><RegionalLink href="/terminos-y-condiciones"><FileText size={17}/>{t("Términos y condiciones","Termos e condições","Terms and conditions")}</RegionalLink><span>{t("Vista previa · No publicada en PROD","Prévia · Não publicada em PROD","Preview · Not published to production")}</span></nav></footer>
 </div>;
}

export default function PreviewSiteFrame({ children, root = false }: { children: ReactNode; root?: boolean }) {
 const shared = useSharedPreviewChrome();
 if (shared && !root) return <main>{children}</main>;
 return <Suspense fallback={<div>{children}</div>}><Frame root={root}>{children}</Frame></Suspense>;
}
