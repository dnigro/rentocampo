"use client";

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
        <div className="rc-map rc-aerial-video">
          <video
            autoPlay
            muted
            playsInline
            preload="metadata"
            aria-label="Vista aérea de actividades agrícolas en la región"
            onTimeUpdate={(event) => {
              const video = event.currentTarget;
              if (Number.isFinite(video.duration) && video.currentTime >= video.duration - 1.1) {
                video.currentTime = 2;
                void video.play();
              }
            }}
          >
            <source src="/RentoCampo_video_real_dron_tractor_silos_mar_16x9.mp4.mp4#t=2" type="video/mp4" />
          </video>
        </div>
      </div>
    </section>
  );
}
