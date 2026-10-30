"use client";

import Image from "next/image";
import fieldPanorama from "@/public/rentocampo-hero-campo-bn-1920x1080.webp";
import RegionalLink from "@/components/layout/RegionalLink";
import { regionalText } from "@/lib/i18n/regional";
import { useRegionalCountry } from "@/lib/i18n/useRegionalCountry";

export default function LandingMapa() {
  const country = useRegionalCountry();
  const t = (es: string, pt: string) => regionalText(country, es, pt);
  return (
    <section className="rc-map-section" id="visibilidad">
      <div className="rc-shell">
        <div className="rc-map-copy">
          <p className="rc-kicker">{t("Tierras productivas en la región", "Terras produtivas na região")}</p>
          <h2 className="rc-map-title">{t("La red del campo", "A rede do campo")}</h2>
          <p>{t("Explorá campos disponibles en la región y encontrá oportunidades por zona y perfil productivo.", "Explore terras disponíveis na região e encontre oportunidades por localização e perfil produtivo.")}</p>
          <p className="rc-map-emphasis">
            {t("Conectamos oportunidades en cada región productiva.", "Conectamos oportunidades em cada região produtiva.")}{" "}
            <RegionalLink href="/alquiler-de-campos">{t("Explorar alquiler de campos →", "Explorar arrendamento rural →")}</RegionalLink>
          </p>
          <RegionalLink href="/campos/mapa" className="rc-button rc-button-yellow">{t("Ver mapa de campos →", "Ver mapa de terras →")}</RegionalLink>
        </div>
        <div className="rc-map rc-map-diagonal">
          <Image
            src={fieldPanorama}
            alt={t("Vista panorámica de tierras productivas en blanco y negro", "Vista panorâmica de terras produtivas em preto e branco")}
            fill
            sizes="(max-width: 900px) 100vw, 62vw"
            className="rc-map-diagonal__photo"
          />
        </div>
      </div>
    </section>
  );
}
