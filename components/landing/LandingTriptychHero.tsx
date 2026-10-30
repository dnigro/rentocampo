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
  {href:"/campos",image:fieldsPhoto,cta:t("VER CAMPOS","VER TERRAS")},
  {href:"/register?tipo=productor",image:producersPhoto,cta:t("SOY PRODUCTOR","SOU PRODUTOR")},
  {href:"/servicios-rurales",image:servicesPhoto,cta:t("VER SERVICIOS","VER SERVIÇOS")}
 ];
 return <section className="rcHero26" id="hero" aria-labelledby="rcHero26-title">
  <div className="rcHero26__left">
   <p className="rcHero26__eyebrow">{t("CONECTAMOS EL CAMPO","CONECTAMOS O CAMPO")}</p>
   <h1 className="rcHero26__heading" id="rcHero26-title">
    <span className="rcHero26__impactLead">{t("SIN","SEM")}</span>
    <span className="rcHero26__impactWord">{t("INTERMEDIARIOS.","INTERMEDIÁRIOS.")}</span>
   </h1>
   <div className="rcHero26__features" aria-label={t("Mapas, chat, productores, tierras y servicios","Mapas, chat, produtores, terras e serviços")}>
    <p className="rcHero26__featurePrimary">{t("MAPAS + CHAT ONLINE","MAPAS + CHAT ONLINE")}</p>
    <p className="rcHero26__featureSecondary">{t("Productores + Tierra + Servicios","Produtores + Terras + Serviços")}</p>
   </div>
   <p className="rcHero26__visionLine">{t("Vos publicás. Vos contactás. Vos acordás.","Você anuncia. Você conversa. Você combina.")}</p>
   <div className="rcHero26__stats" aria-label={t("Sin comisiones y contacto directo","Sem comissões e contato direto")}>
    <div className="rcHero26__stat"><strong>0%</strong><span>{t("COMISIONES.","COMISSÕES.")}</span></div>
    <div className="rcHero26__stat"><strong>100%</strong><span>{t("CONTACTO DIRECTO.","CONTATO DIRETO.")}</span></div>
   </div>
   <RegionalLink href="/register" className="rcHero26__register">{t("REGISTRATE GRATIS","CADASTRE-SE GRÁTIS")} <span aria-hidden="true">→</span></RegionalLink>
  </div>
  <div className="rcHero26__right" aria-label={t("Explorá RentoCampo","Explore a RentoCampo")}>
   {panels.map(p=><RegionalLink key={p.href} href={p.href} className="rcHero26__panel">
    <Image src={p.image} alt="" fill priority={p.href==="/campos"} sizes="(max-width:900px) 33vw, 22vw" className="rcHero26__photo"/>
    <span className="rcHero26__shade" aria-hidden="true"/>
    <span className="rcHero26__panelInner"><span className="rcHero26__panelCta">{p.cta}</span></span>
   </RegionalLink>)}
  </div>
 </section>;
}
