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
        <div className="rc-wheatSteps" aria-label={t("Cómo funciona RentoCampo","Como funciona a RentoCampo")}>
          {[
            [t("Registrate","Cadastre-se"),t("Gratis","Grátis")],
            [t("Explorá","Explore"),t("Campos y servicios","Terras e serviços")],
            [t("Publicá","Anuncie"),t("Tu campo o servicio","Sua terra ou serviço")],
            [t("Conectá","Conecte-se"),t("Sin intermediarios","Sem intermediários")]
          ].map(([name,detail],index)=><div className="rc-wheatSteps__item" key={index}>
            <span className="rc-wheatSteps__number">{index+1}</span>
            <span className="rc-wheatSteps__name">{name}</span>
            <span className="rc-wheatSteps__detail">{detail}</span>
          </div>)}
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
