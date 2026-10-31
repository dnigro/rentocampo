"use client";
import Image from "next/image";
import RegionalLink from "@/components/layout/RegionalLink";
import { useRegionalCountry } from "@/lib/i18n/useRegionalCountry";
import { regionalText } from "@/lib/i18n/regional";
import fields from "@/public/image_trigo_pix.png";
import cattle from "@/public/image_vaca_pix.png";
import services from "@/public/image_truck_pix.png";

export default function LandingSimpleHome(){
 const country=useRegionalCountry();
 const t=(es:string,pt:string,en:string)=>regionalText(country,es,pt,en);
 const panels=[{image:fields,label:t("CAMPOS","TERRAS","FARMLAND")},{image:cattle,label:t("PRODUCTORES","PRODUTORES","FARMERS")},{image:services,label:t("SERVICIOS","SERVIÇOS","SERVICES")}];
 return <main className="rcSimpleHome">
  <section className="rcSimpleHero" id="hero" aria-labelledby="rc-simple-title">
   <div className="rcSimpleHero__content">
    <p className="rcSimpleHero__eyebrow">{t("CONECTAMOS EL CAMPO","CONECTAMOS O CAMPO","CONNECTING RURAL COMMUNITIES")}</p>
    <h1 id="rc-simple-title" className="rcSimpleHero__title"><span>{t("SIN","SEM","NO")}</span><strong>{t("INTERMEDIARIOS.","INTERMEDIÁRIOS.","MIDDLEMEN.")}</strong></h1>
    <div className="rcSimpleHero__features"><p>{t("MAPAS + CHAT ONLINE","MAPAS + CHAT ONLINE","MAPS + ONLINE CHAT")}</p><p>{t("Productores + Tierra + Servicios","Produtores + Terras + Serviços","Farmers + Land + Services")}</p></div>
    <p className="rcSimpleHero__vision">{t("Vos publicás. Vos contactás. Vos acordás.","Você anuncia. Você conversa. Você combina.","You list. You connect. You agree.")}</p>
    <div className="rcSimpleHero__actions">
      <RegionalLink href="/register" className="rcSimpleHero__register">{t("REGISTRATE GRATIS","CADASTRE-SE GRÁTIS","SIGN UP FREE")} <span aria-hidden="true">→</span></RegionalLink>
      <div className="rcSimpleHero__browse">
       <RegionalLink href="/campos">{t("Ver campos","Ver terras","Browse farmland")} <span aria-hidden="true">→</span></RegionalLink>
       <RegionalLink href="/servicios-rurales">{t("Ver servicios","Ver serviços","Browse services")} <span aria-hidden="true">→</span></RegionalLink>
      </div>
    </div>
   </div>
   <div className="rcSimpleHero__art" aria-label={t("Campos, productores y servicios rurales","Terras, produtores e serviços rurais","Farmland, farmers and rural services")}>
    {panels.map((p,i)=><div className={"rcSimpleHero__panel rcSimpleHero__panel--"+i} key={p.label}><Image src={p.image} alt="" fill priority={i===0} sizes="(max-width:900px) 45vw, 25vw" className="rcSimpleHero__image"/><strong className="rcSimpleHero__photoLabel">{p.label}</strong></div>)}
   </div>
  </section>
  <div id="como-funciona" className="rcSimpleTrust"><span>{t("0% COMISIONES","0% COMISSÕES","0% COMMISSIONS")}</span><span>{t("100% CONTACTO DIRECTO","100% CONTATO DIRETO","100% DIRECT CONTACT")}</span></div>
 </main>
}