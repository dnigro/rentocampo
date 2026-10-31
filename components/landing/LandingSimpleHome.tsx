"use client";

import Image from "next/image";
import RegionalLink from "@/components/layout/RegionalLink";
import { useRegionalCountry } from "@/lib/i18n/useRegionalCountry";
import { regionalText } from "@/lib/i18n/regional";
import heroRural from "@/public/rentocampo-hero-campo-bn-1920x1080.webp";

/** Una sola pantalla: explorar libremente y registrarse sin fricción. */
export default function LandingSimpleHome() {
  const country = useRegionalCountry();
  const t = (es: string, pt: string, en: string) => regionalText(country, es, pt, en);

  return (
    <main className="rcSimpleHome">
      <section className="rcSimpleHero" aria-labelledby="rc-simple-title">
        <Image
          src={heroRural}
          alt=""
          fill
          priority
          sizes="100vw"
          className="rcSimpleHero__image"
        />
        <div className="rcSimpleHero__overlay" aria-hidden="true" />
        <div className="rcSimpleHero__content">
          <p className="rcSimpleHero__eyebrow">
            {t("CAMPOS + SERVICIOS RURALES", "TERRAS + SERVIÇOS RURAIS", "FARMLAND + RURAL SERVICES")}
          </p>
          <h1 id="rc-simple-title" className="rcSimpleHero__title">
            {t("El campo,", "O campo,", "Farmland,")}
            <span>{t("más cerca.", "mais perto.", "closer to you.")}</span>
          </h1>
          <p className="rcSimpleHero__description">
            {t("Encontrá campos y servicios. Contactá directamente.", "Encontre terras e serviços. Entre em contato diretamente.", "Explore farmland and services. Connect directly.")}
          </p>
          <div className="rcSimpleHero__actions" aria-label={t("Accesos principales", "Acessos principais", "Main actions")}>
            <RegionalLink href="/register" className="rcSimpleHero__action rcSimpleHero__action--primary">
              {t("Registrate gratis", "Cadastre-se grátis", "Sign up free")}
              <span aria-hidden="true">↗</span>
            </RegionalLink>
            <RegionalLink href="/campos" className="rcSimpleHero__action rcSimpleHero__action--secondary">
              {t("Ver campos", "Ver terras", "Browse farmland")}
              <span aria-hidden="true">→</span>
            </RegionalLink>
            <RegionalLink href="/servicios-rurales" className="rcSimpleHero__action rcSimpleHero__action--secondary">
              {t("Ver servicios", "Ver serviços", "Browse services")}
              <span aria-hidden="true">→</span>
            </RegionalLink>
          </div>
        </div>
      </section>
      <div id="como-funciona" className="rcSimpleTrust" aria-label={t("Ventajas", "Vantagens", "Benefits")}>
        <span>{t("GRATIS", "GRÁTIS", "FREE")}</span>
        <span>{t("SIN INTERMEDIARIOS", "SEM INTERMEDIÁRIOS", "NO MIDDLEMEN")}</span>
        <span>{t("SIN COMISIONES", "SEM COMISSÕES", "NO COMMISSIONS")}</span>
      </div>
    </main>
  );
}
