"use client";
import RegionalLink from "@/components/layout/RegionalLink";
import { regionalText } from "@/lib/i18n/regional";
import { useRegionalCountry } from "@/lib/i18n/useRegionalCountry";
import "@/styles/hero-2026-isolated.css";

export default function LandingTriptychHero() {
 const country=useRegionalCountry();
 const t=(es:string,pt:string)=>regionalText(country,es,pt);
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
  <div className="rcHomeVideo" aria-label={t("Video panorámico del campo","Vídeo panorâmico do campo")}>
   <video
    className="rcHomeVideo__player"
    style={{ position:"absolute", inset:0, display:"block", width:"100%", height:"100%", maxWidth:"none", objectFit:"cover", objectPosition:"center 52%", filter:"grayscale(1) contrast(1.08)" }}
    autoPlay
    muted
    playsInline
    loop
    preload="metadata"
    poster="/rentocampo-hero-campo-bn-1920x1080.webp"
    aria-label={t("Vista aérea de actividades agrícolas en la región","Vista aérea das atividades agrícolas na região")}
    onTimeUpdate={(event) => {
     // Evita el frame en negro de algunos dispositivos al terminar el MP4.
     const video=event.currentTarget;
     if (Number.isFinite(video.duration) && video.currentTime>=video.duration-1.1) {
      video.currentTime=2;
      void video.play().catch(()=>{});
     }
    }}
   >
    <source src="/RentoCampo_video_real_dron_tractor_silos_mar_16x9.mp4.mp4#t=2" type="video/mp4"/>
   </video>
  </div>
 </section>;
}
