"use client";

import RegionalLink from "@/components/layout/RegionalLink";
import { regionalText } from "@/lib/i18n/regional";
import { useRegionalCountry } from "@/lib/i18n/useRegionalCountry";

/**
 * Experimento visual de la portada. Tríptico editorial: Campos, Productores
 * y Servicios Rurales. Mantiene enlaces reales y selector regional del Navbar.
 */
export default function LandingTriptychHero() {
  const country = useRegionalCountry();
  const t = (es: string, pt: string) => regionalText(country, es, pt);
  return (
    <section className="triptychHero" id="hero" aria-labelledby="triptychHero-title">
      <div className="rc-wheatHero">
        <h1 className="rc-wheatHero__title" id="triptychHero-title">{t("Encontrá, publicá y conectá con el campo.","Encontre, anuncie e conecte-se com o campo.")}</h1>
        <p className="rc-wheatHero__subtitle">{t("Una experiencia simple para productores, propietarios y servicios rurales.","Uma experiência simples para produtores, proprietários e serviços rurais.")}</p>
        <ol className="rc-wheatHero__steps">
          {[
            [t("Registrate","Cadastre-se"),t("Creá tu cuenta gratis en minutos.","Crie sua conta grátis em minutos.")],
            [t("Explorá","Explore"),t("Buscá campos y servicios en el mapa.","Encontre terras e serviços no mapa.")],
            [t("Publicá","Anuncie"),t("Sumá tus campos o servicios gratis.","Anuncie terras ou serviços gratuitamente.")],
            [t("Conectá","Conecte-se"),t("Contactá de forma directa y sin intermediarios.","Entre em contato diretamente, sem intermediários.")]
          ].map(([title,description],i)=><li className="rc-wheatHero__step" key={i}>
            <div className="rc-wheatHero__symbol"><span className="rc-wheatHero__number">{i+1}</span>
              {i===0&&<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="20" cy="13" r="8"/><path d="M5 42v-5c0-9 7-15 15-15 6 0 10 2 13 6M37 30v15M29 37h16"/></svg>}
              {i===1&&<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M5 17 17 12l14 5 12-5v28l-12 5-14-5-12 5zM17 12v28M31 17v28"/><path d="M24 3c-6 0-10 4-10 10 0 6 10 17 10 17s10-11 10-17c0-6-4-10-10-10z"/><circle cx="24" cy="13" r="3"/></svg>}
              {i===2&&<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M33 24V7a4 4 0 0 0-4-4H10a4 4 0 0 0-4 4v34a4 4 0 0 0 4 4h15M13 14h14M13 23h12M13 32h9M35 29v16M27 37h16"/></svg>}
              {i===3&&<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M6 8h25a5 5 0 0 1 5 5v17a5 5 0 0 1-5 5H17L7 43v-8a5 5 0 0 1-6-5V13a5 5 0 0 1 5-5zM36 18h5a5 5 0 0 1 5 5v17l-7-5"/></svg>}
            </div>
            <h2 className="rc-wheatHero__stepTitle">{title}</h2>
            <p className="rc-wheatHero__stepText">{description}</p>
          </li>)}
        </ol>
        <RegionalLink href="/register" className="rc-wheatHero__cta">{t("REGISTRATE","CADASTRE-SE")}</RegionalLink>
      </div>
    </section>
  );
}
