"use client";

import Image from "next/image";
import { UserRoundPlus, FilePlus2, Handshake, ArrowRight } from "lucide-react";
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
        <p className="triptychHero__countries" aria-label="Argentina, Uruguay, Paraguay, Chile, Bolivia, Perú y Brasil">AR · UY · PY · CL · BO · PE · BR</p>
        <h1 className="triptychHero__title" id="triptychHero-title">
          <span>{t("#1 RED", "#1 REDE")}</span>
          <strong>{t("GRATIS PARA EL CAMPO.", "GRÁTIS PARA O CAMPO.")}</strong>
        </h1>
        <p className="triptychHero__summary">
          {t("Campos, productores y servicios rurales en un solo lugar.", "Terras, produtores e serviços rurais em um só lugar.")}
        </p>
        <div className="triptychHero__workflow" aria-label={t("Cómo funciona en tres pasos", "Como funciona em três passos")}>
          <div className="triptychHero__step"><UserRoundPlus aria-hidden="true" /><span className="triptychHero__stepNumber">01</span><strong>{t("REGISTRATE", "CADASTRE-SE")}</strong><small>{t("Creá tu perfil gratis y elegí cómo participar.", "Crie seu perfil grátis e escolha como participar.")}</small></div>
          <ArrowRight className="triptychHero__flowArrow" aria-hidden="true" />
          <div className="triptychHero__step"><FilePlus2 aria-hidden="true" /><span className="triptychHero__stepNumber">02</span><strong>{t("PUBLICÁ Y CHATEÁ", "PUBLIQUE E CONVERSE")}</strong><small>{t("Mostrá tu campo y conversá online.", "Anuncie suas terras e converse online.")}</small></div>
          <ArrowRight className="triptychHero__flowArrow" aria-hidden="true" />
          <div className="triptychHero__step"><Handshake aria-hidden="true" /><span className="triptychHero__stepNumber">03</span><strong>{t("CERRÁ UN ACUERDO", "FECHE UM ACORDO")}</strong><small>{t("Conectá con productores o contratistas.", "Conecte-se com produtores ou prestadores.")}</small></div>
        </div>
        {/* Explicación directa para móvil; los pasos gráficos de desktop se conservan. */}
        <div className="triptychHero__howItWorksMobile" aria-labelledby="triptychHero-howItWorks">
          <h2 id="triptychHero-howItWorks">
            <span className="triptychHero__headlineStart">{t("Publicá, buscá", "Anuncie, busque")}</span>
            <span className="triptychHero__headlineEnd">{t("y conectá", "e conecte-se")}{" "}<strong>{t("100% gratis.", "100% grátis.")}</strong></span>
          </h2>
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
