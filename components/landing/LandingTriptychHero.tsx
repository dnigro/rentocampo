"use client";

import Image from "next/image";
import RegionalLink from "@/components/layout/RegionalLink";
import fieldsPhoto from "@/public/image_eol_pix.png";
import producersPhoto from "@/public/image_vaca_pix.png";
import servicesPhoto from "@/public/image_truck_pix.png";
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
      <div className="triptychHero__mobileHero">
      <div className="triptychHero__intro">
        <p className="triptychHero__countries">AR · UY · PY · CL · BO · PE · BR</p>
        <h1 className="triptychHero__title" id="triptychHero-title">
          <span>{t("#1 RED", "#1 REDE")}</span>
          <strong>{t("GRATIS PARA EL CAMPO.", "GRÁTIS PARA O CAMPO.")}</strong>
        </h1>
        <p className="triptychHero__summary">{t("Encontrá oportunidades, publicá gratis y conectá de forma directa.", "Encontre oportunidades, anuncie grátis e conecte-se diretamente.")}</p>
        <div className="rc-option6" aria-label={t("Explorá, publicá y conectá", "Explore, anuncie e conecte-se")}>
          <div className="rc-option6__step"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3c-6 0-10 4-10 10 0 7 10 16 10 16s10-9 10-16C26 7 22 3 16 3zM16 9a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/></svg><strong>{t("Explorá","Explore")}</strong><small>{t("Campos y servicios.","Terras e serviços.")}</small></div>
          <span className="rc-option6__arrow" aria-hidden="true">➜</span>
          <div className="rc-option6__step"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M7 3h14l5 5v10M7 3v26h12M21 3v6h5M11 14h11M11 19h7M25 21v9M20 26h10"/></svg><strong>{t("Publicá","Anuncie")}</strong><small>{t("Tus campos gratis.","Suas terras grátis.")}</small></div>
          <span className="rc-option6__arrow" aria-hidden="true">➜</span>
          <div className="rc-option6__step"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M4 5h19a4 4 0 0 1 4 4v13a4 4 0 0 1-4 4H13l-7 5v-5H4a3 3 0 0 1-3-3V9a4 4 0 0 1 3-4z"/></svg><strong>{t("Conectá","Conecte-se")}</strong><small>{t("Sin intermediarios.","Sem intermediários.")}</small></div>
        </div>
      </div>

      <nav className="triptychHero__actions" aria-label={t("Acciones principales", "Ações principais")}>
        <RegionalLink href="/register" className="triptychHero__button triptychHero__button--register">
          <span>{t("REGISTRATE", "CADASTRE-SE")}</span>
        </RegionalLink>
      </nav>
      </div>

      <div className="triptychHero__panels" aria-label={t("Explorá RentoCampo", "Explore a RentoCampo")}>
        <RegionalLink className="triptychHero__panel triptychHero__panel--fields" href="/campos">
          <Image
            src={fieldsPhoto}
            alt=""
            fill
            priority
            sizes="(max-width: 900px) 100vw, 27vw"
            className="triptychHero__photo"
          />
          <span className="triptychHero__panelShade" aria-hidden="true" />
          <span className="triptychHero__panelContent">
            <span className="triptychHero__panelTitle">{t("Campos", "Terras")}</span>
            <span className="triptychHero__panelText">{t("Venta, alquiler y oportunidades", "Venda, arrendamento e oportunidades")}</span>
            <span className="triptychHero__panelCta">{t("VER CAMPOS", "VER TERRAS")}</span>
          </span>
        </RegionalLink>
        <RegionalLink className="triptychHero__panel triptychHero__panel--producers" href="/register?tipo=productor">
          <Image
            src={producersPhoto}
            alt=""
            fill
            sizes="(max-width: 900px) 100vw, 27vw"
            className="triptychHero__photo"
          />
          <span className="triptychHero__panelShade" aria-hidden="true" />
          <span className="triptychHero__panelContent">
            <span className="triptychHero__panelTitle">{t("Productores", "Produtores")}</span>
            <span className="triptychHero__panelText">{t("Conectá y hacé crecer tu producción", "Conecte-se e amplie sua produção")}</span>
            <span className="triptychHero__panelCta">{t("SOY PRODUCTOR", "SOU PRODUTOR")}</span>
          </span>
        </RegionalLink>
        <RegionalLink className="triptychHero__panel triptychHero__panel--services" href="/servicios-rurales">
          <Image
            src={servicesPhoto}
            alt=""
            fill
            sizes="(max-width: 900px) 100vw, 29vw"
            className="triptychHero__photo"
          />
          <span className="triptychHero__panelShade" aria-hidden="true" />
          <span className="triptychHero__panelContent">
            <span className="triptychHero__panelTitle">{t("Servicios rurales", "Serviços rurais")}</span>
            <span className="triptychHero__panelText">{t("Todo el apoyo que el campo necesita", "Todo o apoio de que o campo precisa")}</span>
            <span className="triptychHero__panelCta">{t("VER SERVICIOS", "VER SERVIÇOS")}</span>
          </span>
        </RegionalLink>
      </div>


    </section>
  );
}
