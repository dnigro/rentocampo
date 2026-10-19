"use client";
import RegionalLink from "@/components/layout/RegionalLink";
import { regionalText } from "@/lib/i18n/regional";
import { useRegionalCountry } from "@/lib/i18n/useRegionalCountry";
export default function LandingTriptychHero() {
 const country=useRegionalCountry();
 const t=(es:string,pt:string)=>regionalText(country,es,pt);
 const steps=[
  {title:t("Registrate","Cadastre-se"),description:t("Creá tu cuenta gratis en minutos.","Crie sua conta grátis em minutos."),icon:"user"},
  {title:t("Explorá","Explore"),description:t("Buscá campos y servicios en el mapa.","Encontre terras e serviços no mapa."),icon:"map"},
  {title:t("Publicá","Anuncie"),description:t("Sumá tus campos o servicios gratis.","Anuncie terras ou serviços gratuitamente."),icon:"post"},
  {title:t("Conectá","Conecte-se"),description:t("Contactá de forma directa y sin intermediarios.","Entre em contato diretamente, sem intermediários."),icon:"chat"}
 ];
 return <section className="triptychHero" id="hero" aria-labelledby="triptychHero-title"><div className="rc-heroWorkflow">
  <h1 id="triptychHero-title" className="rc-heroWorkflow__title">{t("Encontrá, publicá y conectá con el campo.","Encontre, anuncie e conecte-se com o campo.")}</h1>
  <p className="rc-heroWorkflow__subtitle">{t("Una experiencia simple para productores, propietarios y servicios rurales.","Uma experiência simples para produtores, proprietários e serviços rurais.")}</p>
  <ol className="rc-heroWorkflow__steps">{steps.map((s,i)=><li className="rc-heroWorkflow__step" key={s.icon}>
   <div className="rc-heroWorkflow__icon"><span className="rc-heroWorkflow__number">{i+1}</span>
    {s.icon==="user"&&<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="21" cy="14" r="8"/><path d="M5 42v-5c0-9 7-15 16-15 5 0 9 2 12 6M37 31v14M30 38h14"/></svg>}
    {s.icon==="map"&&<svg viewBox="0 0 48 48" aria-hidden="true"><path d="m4 14 12-5 16 5 16-5v29l-16 5-16-5-12 5zM16 9v29M32 14v29"/><path d="M24 3c-6 0-10 4-10 10 0 7 10 18 10 18s10-11 10-18c0-6-4-10-10-10z"/><circle cx="24" cy="13" r="3"/></svg>}
    {s.icon==="post"&&<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M33 24V7a4 4 0 0 0-4-4H10a4 4 0 0 0-4 4v34a4 4 0 0 0 4 4h15M13 14h14M13 23h12M13 32h9M35 29v16M27 37h16"/></svg>}
    {s.icon==="chat"&&<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M6 8h25a5 5 0 0 1 5 5v17a5 5 0 0 1-5 5H17L7 43v-8a5 5 0 0 1-6-5V13a5 5 0 0 1 5-5zM36 18h5a5 5 0 0 1 5 5v17l-7-5"/></svg>}
   </div><h2 className="rc-heroWorkflow__stepTitle">{s.title}</h2><p className="rc-heroWorkflow__stepText">{s.description}</p>
  </li>)}</ol>
  <RegionalLink href="/register" className="rc-heroWorkflow__cta">{t("REGISTRATE","CADASTRE-SE")}</RegionalLink>
 </div></section>;
}
