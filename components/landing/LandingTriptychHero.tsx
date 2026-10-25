"use client";
import Image from "next/image";
import RegionalLink from "@/components/layout/RegionalLink";
import fieldsPhoto from "@/public/image_eol_pix.png";
import producersPhoto from "@/public/image_vaca_pix.png";
import servicesPhoto from "@/public/image_truck_pix.png";
import { regionalText } from "@/lib/i18n/regional";
import { useRegionalCountry } from "@/lib/i18n/useRegionalCountry";
import "@/styles/hero-2026-isolated.css";

export default function LandingTriptychHero() {
 const country=useRegionalCountry();
 const t=(es:string,pt:string)=>regionalText(country,es,pt);
 const panels=[
  {href:"/campos",image:fieldsPhoto,title:t("CAMPOS","TERRAS"),cta:t("VER CAMPOS","VER TERRAS")},
  {href:"/register?tipo=productor",image:producersPhoto,title:t("PRODUCTORES","PRODUTORES"),cta:t("SOY PRODUCTOR","SOU PRODUTOR")},
  {href:"/servicios-rurales",image:servicesPhoto,title:t("SERVICIOS RURALES","SERVIÇOS RURAIS"),cta:t("VER SERVICIOS","VER SERVIÇOS")}
 ];
 return <section className="rcHero26" id="hero" aria-labelledby="rcHero26-title">
  <div className="rcHero26__left">
   <h1 className="rcHero26__heading" id="rcHero26-title">
    <span className="rcHero26__number">#1</span>
    <span className="rcHero26__chooseCountry">{t("SELECCIONÁ TU PAÍS","SELECIONE SEU PAÍS")}</span>
   </h1>
   <ol className="rcHero26__steps" aria-label={t("Cómo funciona RentoCampo","Como funciona a RentoCampo")}>
    {[
     t("REGISTRATE GRATIS","CADASTRE-SE GRÁTIS"),
     t("CHATEÁ ONLINE","CONVERSE ONLINE"),
     t("MAPA POR REGIÓN","MAPA POR REGIÃO"),
     t("ACORDÁ LAS CONDICIONES","COMBINE AS CONDIÇÕES")
    ].map((step,index)=><li key={step}><span className="rcHero26__stepNumber" aria-hidden="true">{index+1}</span><span>{step}</span></li>)}
   </ol>
   <p className="rcHero26__freeLine"><span className="rcHero26__freeText">{t("100% GRATIS,","100% GRÁTIS,")}</span><span className="rcHero26__sumate">{t("SUMATE","JUNTE-SE")}</span></p>
   <RegionalLink href="/register" className="rcHero26__register">{t("REGISTRATE →","CADASTRE-SE →")}</RegionalLink>
  </div>
  <div className="rcHero26__right" aria-label={t("Explorá RentoCampo","Explore a RentoCampo")}>
   {panels.map(p=><RegionalLink key={p.href} href={p.href} className="rcHero26__panel">
    <Image src={p.image} alt="" fill priority={p.href==="/campos"} sizes="(max-width:900px) 33vw, 22vw" className="rcHero26__photo"/>
    <span className="rcHero26__shade" aria-hidden="true"/>
    <span className="rcHero26__panelInner"><span className="rcHero26__panelCta">{p.cta}</span><span className="rcHero26__panelTitle">{p.title}</span></span>
   </RegionalLink>)}
  </div>
 </section>;
}
