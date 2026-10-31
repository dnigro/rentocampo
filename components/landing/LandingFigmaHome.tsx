"use client";

import Image from "next/image";
import RegionalLink from "@/components/layout/RegionalLink";
import { regionalText } from "@/lib/i18n/regional";
import { useRegionalCountry } from "@/lib/i18n/useRegionalCountry";
import "@/styles/home-figma-sin-vueltas.css";

/**
 * Home 2026 — dirección visual Figma 01 + 02 + 08.
 * Mantiene el Navbar, el selector regional, las rutas de registro y el Footer
 * existentes. No altera los flujos de publicación, mapa ni perfil.
 */
export default function LandingFigmaHome() {
  const country = useRegionalCountry();
  const t = (es: string, pt: string, en: string) =>
    regionalText(country, es, pt, en);

  return (
      <section className="rcf-hero" id="hero" aria-labelledby="rcf-hero-title">
        <div className="rcf-hero__photo" aria-hidden="true">
          <Image
            src="/image_vaca_pix.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="rcf-cover rcf-cover--cattle"
          />
        </div>
        <div className="rcf-hero__matte" aria-hidden="true" />
        <div className="rcf-hero__content">
          <p className="rcf-eyebrow rcf-hero__eyebrow">
            {t("CONECTÁ DIRECTO.", "CONECTE-SE DIRETO.", "CONNECT DIRECTLY.")}
          </p>
          <h1 id="rcf-hero-title" className="rcf-hero__title">
            <span>{t("EL CAMPO.", "O CAMPO.", "RURAL LIFE.")}</span>
            <span>{t("SIN VUELTAS.", "SEM COMPLICAÇÕES.", "MADE SIMPLE.")}</span>
          </h1>
          <span className="rcf-rule" aria-hidden="true" />
          <p className="rcf-hero__description">
            {t(
              "Campos y servicios. Contacto directo.",
              "Terras e serviços. Contato direto.",
              "Land and services. Direct contact.",
            )}
          </p>
          <div className="rcf-actions">
            <RegionalLink href="/register" className="rcf-pill rcf-pill--light">
              {t("Registrate gratis", "Cadastre-se grátis", "Sign up free")}
            </RegionalLink>
            <RegionalLink href="/campos/mapa" className="rcf-pill rcf-pill--forest">
              {t("Explorar el mapa", "Explorar o mapa", "Explore the map")}
            </RegionalLink>
          </div>
          <div className="rcf-hero__proof" aria-label={t("0% comisión. 100% contacto directo.", "0% comissão. 100% contato direto.", "0% commission. 100% direct contact.")}>
            <div className="rcf-hero__metric"><strong className="rcf-hero__metric-value">0%</strong><span className="rcf-hero__metric-label">{t("COMISIÓN", "COMISSÃO", "COMMISSION")}</span></div>
            <span className="rcf-hero__divider" aria-hidden="true" />
            <div className="rcf-hero__metric"><strong className="rcf-hero__metric-value">100%</strong><span className="rcf-hero__metric-label">{t("CONTACTO DIRECTO", "CONTATO DIRETO", "DIRECT CONTACT")}</span></div>
          </div>
        </div>
      </section>
  );
}
