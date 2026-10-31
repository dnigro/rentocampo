"use client";

import Image from "next/image";
import RegionalLink from "@/components/layout/RegionalLink";
import { useRegionalCountry } from "@/lib/i18n/useRegionalCountry";
import { regionalText } from "@/lib/i18n/regional";
import landscape from "@/public/hero-campo.jpeg";

/**
 * RentoCampo / Manifiesto: una afirmación, tres accesos y una sola fotografía.
 * Identidad propia (marfil, carbón, cobre), sin tríptico ni cards de plantilla.
 */
export default function LandingSimpleHome() {
  const country = useRegionalCountry();
  const t = (es: string, pt: string, en: string) => regionalText(country, es, pt, en);

  return (
    <main className="rcManifesto">
      <section className="rcManifestoHero" id="hero" aria-labelledby="rc-manifesto-title">
        <div className="rcManifestoCopy">
          <p className="rcManifestoKicker">
            {t("CAMPOS / SERVICIOS / CONTACTO DIRECTO",
               "TERRAS / SERVIÇOS / CONTATO DIRETO",
               "FARMLAND / SERVICES / DIRECT CONTACT")}
          </p>
          <h1 id="rc-manifesto-title" className="rcManifestoTitle">
            <span>{t("EL CAMPO", "O CAMPO", "THE LAND")}</span>
            <strong>{t("NO ESPERA.", "NÃO ESPERA.", "DOESN'T WAIT.")}</strong>
          </h1>
          <p className="rcManifestoDescription">
            {t(
              "Encontrá campos y servicios rurales. Hablá directo, sin intermediarios ni comisiones.",
              "Encontre terras e serviços rurais. Fale diretamente, sem intermediários nem comissões.",
              "Find farmland and rural services. Connect directly, without middlemen or commissions."
            )}
          </p>
          <nav className="rcManifestoActions" aria-label={t("Explorar o registrarse", "Explorar ou cadastrar-se", "Browse or sign up")}>
            <RegionalLink href="/campos" className="rcManifestoButton rcManifestoButton--primary">
              {t("EXPLORAR CAMPOS", "EXPLORAR TERRAS", "EXPLORE FARMLAND")}
            </RegionalLink>
            <RegionalLink href="/servicios-rurales" className="rcManifestoButton rcManifestoButton--secondary">
              {t("VER SERVICIOS", "VER SERVIÇOS", "BROWSE SERVICES")}
            </RegionalLink>
            <RegionalLink href="/register" className="rcManifestoButton rcManifestoButton--tertiary">
              {t("REGISTRATE GRATIS", "CADASTRE-SE GRÁTIS", "SIGN UP FREE")}
            </RegionalLink>
          </nav>
        </div>
        <div className="rcManifestoVisual">
          <Image
            src={landscape}
            alt={t("Paisaje rural con campos abiertos", "Paisagem rural com terras abertas", "Rural landscape with open fields")}
            fill
            priority
            sizes="(max-width:850px) 100vw, 46vw"
            className="rcManifestoVisualImage"
          />
          <div className="rcManifestoVisualEdge" aria-hidden="true" />
          <span className="rcManifestoVisualCaption" aria-hidden="true">
            R / C — {t("TIERRA & CONEXIÓN", "TERRA & CONEXÃO", "LAND & CONNECTION")}
          </span>
        </div>
      </section>
      <div className="rcManifestoTrust" id="como-funciona">
        <span>{t("SIN INTERMEDIARIOS", "SEM INTERMEDIÁRIOS", "NO MIDDLEMEN")}</span>
        <span>{t("0% COMISIONES", "0% COMISSÕES", "0% COMMISSIONS")}</span>
        <span>{t("CONTACTO DIRECTO", "CONTATO DIRETO", "DIRECT CONTACT")}</span>
      </div>
    </main>
  );
}
