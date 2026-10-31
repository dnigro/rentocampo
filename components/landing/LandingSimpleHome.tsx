"use client";

import Image from "next/image";
import RegionalLink from "@/components/layout/RegionalLink";
import { useRegionalCountry } from "@/lib/i18n/useRegionalCountry";
import { regionalText } from "@/lib/i18n/regional";
import fields from "@/public/image_trigo_pix.png";
import cattle from "@/public/image_vaca_pix.png";
import services from "@/public/image_truck_pix.png";

/** Portada breve: misma marca, tres acciones y tríptico diagonal. */
export default function LandingSimpleHome() {
  const country = useRegionalCountry();
  const t = (es: string, pt: string, en: string) => regionalText(country, es, pt, en);
  const panels = [
    { image: fields, label: t("CAMPOS", "TERRAS", "FARMLAND") },
    { image: cattle, label: t("PRODUCTORES", "PRODUTORES", "FARMERS") },
    { image: services, label: t("SERVICIOS", "SERVIÇOS", "SERVICES") },
  ];

  return (
    <main className="rcSimpleHome">
      <section className="rcSimpleHero" id="hero" aria-labelledby="rc-simple-title">
        <div className="rcSimpleHero__content">
          <h1 id="rc-simple-title" className="rcSimpleHero__title">
            <span>{t("SIN", "SEM", "NO")}</span>
            <strong>{t("INTERMEDIARIOS.", "INTERMEDIÁRIOS.", "MIDDLEMEN.")}</strong>
          </h1>
          <div className="rcSimpleHero__features">
            <p className="rcSimpleHero__featurePrimary">{t("MAPAS + CHAT ONLINE", "MAPAS + CHAT ONLINE", "MAPS + ONLINE CHAT")}</p>
            <p className="rcSimpleHero__featureSecondary">{t("Productores + Tierra + Servicios", "Produtores + Terras + Serviços", "Farmers + Land + Services")}</p>
          </div>

          <nav className="rcSimpleHero__actions" aria-label={t("Explorar o registrarse", "Explorar ou cadastrar-se", "Explore or sign up")}>
            <RegionalLink href="/register" className="rcSimpleHero__register">
              {t("REGISTRATE GRATIS", "CADASTRE-SE GRÁTIS", "SIGN UP FREE")} <span aria-hidden="true">→</span>
            </RegionalLink>
            <div className="rcSimpleHero__browse">
              <RegionalLink href="/campos" className="rcSimpleHero__browseLink">
                {t("Ver campos", "Ver terras", "Browse farmland")} <span aria-hidden="true">→</span>
              </RegionalLink>
              <RegionalLink href="/servicios-rurales" className="rcSimpleHero__browseLink">
                {t("Ver servicios", "Ver serviços", "Browse services")} <span aria-hidden="true">→</span>
              </RegionalLink>
            </div>
          </nav>
        </div>

        <div className="rcSimpleHero__art" role="img" aria-label={t("Tríptico rural de campos, productores y servicios", "Tríptico rural de terras, produtores e serviços", "Rural photographs of farmland, farmers and services")}>
          {panels.map((panel, i) => (
            <div className={`rcSimpleHero__panel rcSimpleHero__panel--${i}`} key={panel.label}>
              <Image src={panel.image} alt="" fill priority={i === 0} sizes="(max-width: 900px) 45vw, 30vw" className="rcSimpleHero__image"/>
              <span className="rcSimpleHero__photoLabel" aria-hidden="true">{panel.label}</span>
            </div>
          ))}
        </div>
      </section>
      <div className="rcSimpleTrust" id="como-funciona">
        <span>{t("0% COMISIONES", "0% COMISSÕES", "0% COMMISSIONS")}</span>
        <span aria-hidden="true">·</span>
        <span>{t("100% CONTACTO DIRECTO", "100% CONTATO DIRETO", "100% DIRECT CONTACT")}</span>
      </div>
    </main>
  );
}
