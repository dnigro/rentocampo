"use client";

import Image from "next/image";
import { MapPinned, MessagesSquare } from "lucide-react";
import RegionalLink from "@/components/layout/RegionalLink";
import { useRegionalCountry } from "@/lib/i18n/useRegionalCountry";
import { regionalText } from "@/lib/i18n/regional";
import "@/styles/hero-simple-map-chat.css";

/**
 * Misma propuesta en home desktop, web móvil y App Lite.
 * El mapa muestra la oferta y el chat conecta directamente a las personas.
 */
export default function SimpleMapChatHero({ lite = false }: { lite?: boolean }) {
  const country = useRegionalCountry();
  const t = (es: string, pt: string, en: string) => regionalText(country, es, pt, en);

  return (
    <section className="rcsm" id="hero" aria-labelledby="rcsm-title">
      <div className="rcsm-layout">
        <div className="rcsm-photo" aria-hidden="true">
          <Image src="/image_vaca_pix.png" alt="" fill priority sizes="(max-width: 850px) 100vw, 48vw" className="rcsm-photo__image" />
        </div>

        <div className="rcsm-panel">
          <p className="rcsm-eyebrow">{t("TIERRAS QUE PRODUCEN FUTURO", "TERRAS QUE PRODUZEM FUTURO", "LAND THAT BUILDS THE FUTURE")}</p>
          <h1 className="rcsm-title" id="rcsm-title"><span className="rcsm-title__first-line">{t("Tu tierra tiene valor.", "Sua terra tem valor.", "Your land has value.")}</span><br />{t("Agregala al mapa.", "Adicione-a ao mapa.", "Add it to the map.")}<br />{t("Chateá en línea.", "Converse online.", "Chat online.")}</h1>
          <p className="rcsm-description rcsm-description--audience">
            <strong className="rcsm-description__audience">{t("PRODUCTORES Y SERVICIOS RURALES", "PRODUTORES E SERVIÇOS RURAIS", "PRODUCERS AND RURAL SERVICES")}</strong>
            <span className="rcsm-description__invite">{t("¡SUMATE!", "PARTICIPE!", "JOIN US!")}</span>
          </p>

          <div className="rcsm-features" aria-label={t("Mapa y chat online", "Mapa e chat online", "Map and online chat")}>
            <div className="rcsm-feature">
              <MapPinned className="rcsm-feature__icon" strokeWidth={1.8} aria-hidden="true" />
              <div>
                <h2>{t("MAPA", "MAPA", "MAP")}</h2>
                <p>{t("Seleccioná la zona", "Escolha a região", "Select an area")}</p>
              </div>
            </div>
            <div className="rcsm-feature">
              <MessagesSquare className="rcsm-feature__icon" strokeWidth={1.8} aria-hidden="true" />
              <div>
                <h2>{t("CHAT ONLINE", "CHAT ONLINE", "ONLINE CHAT")}</h2>
                <p>{t("Contactá en línea", "Converse online", "Connect online")}</p>
              </div>
            </div>
          </div>

          <div className="rcsm-actions">
            <RegionalLink href={lite ? "/lite/cuenta/registro" : "/register"} className="rcsm-button rcsm-button--primary">
              {t("Registrate gratis", "Cadastre-se grátis", "Sign up free")}
            </RegionalLink>
            <RegionalLink href="/campos/mapa" className="rcsm-button rcsm-button--secondary">
              <MapPinned size={21} strokeWidth={2} aria-hidden="true" />
              {t("Explorar campos", "Explorar terras", "Explore land")}
            </RegionalLink>
          </div>
        </div>
      </div>
      <div className="rcsm-proof" aria-label={t("0% comisión y 100% contacto directo", "0% comissão e 100% contato direto", "0% commission and 100% direct contact")}>
        <div className="rcsm-proof__item"><strong>0%</strong><span>{t("COMISIÓN", "COMISSÃO", "COMMISSION")}</span></div>
        <span className="rcsm-proof__separator" aria-hidden="true" />
        <div className="rcsm-proof__item"><strong>100%</strong><span>{t("CONTACTO DIRECTO", "CONTATO DIRETO", "DIRECT CONTACT")}</span></div>
      </div>
    </section>
  );
}
