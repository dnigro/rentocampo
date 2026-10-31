"use client";

import Image from "next/image";
import RegionalLink from "@/components/layout/RegionalLink";
import { useRegionalCountry } from "@/lib/i18n/useRegionalCountry";
import { regionalText } from "@/lib/i18n/regional";
import photoFields from "@/public/image_trigo_pix.png";
import photoCattle from "@/public/image_vaca_pix.png";
import photoServices from "@/public/image_truck_pix.png";

/** Portada con lenguaje de catálogo: producto primero, tipografía simple, foto documental. */
export default function LandingSimpleHome() {
  const country = useRegionalCountry();
  const t = (es: string, pt: string, en: string) => regionalText(country, es, pt, en);
  const panels = [
    { image: photoFields, label: t("Campos", "Terras", "Farmland"), css: "fields" },
    { image: photoCattle, label: t("Productores", "Produtores", "Farmers"), css: "producers" },
    { image: photoServices, label: t("Servicios", "Serviços", "Services"), css: "services" },
  ];

  return (
    <main className="rcSimpleHome">
      <section className="rcSimpleHero" id="hero" aria-labelledby="rc-simple-title">
        <div className="rcSimpleHero__content">
          <p className="rcSimpleHero__eyebrow">
            {t("PLATAFORMA RURAL", "PLATAFORMA RURAL", "RURAL MARKETPLACE")}
            <span className="rcSimpleHero__edition">/ RentoCampo</span>
          </p>

          <h1 id="rc-simple-title" className="rcSimpleHero__title">
            {t("Campos y servicios.", "Terras e serviços.", "Farmland and services.")}
            <span>{t("Contacto directo.", "Contato direto.", "Direct connections.")}</span>
          </h1>

          <p className="rcSimpleHero__description">
            {t(
              "Explorá oportunidades rurales sin intermediarios ni comisiones.",
              "Explore oportunidades rurais sem intermediários nem comissões.",
              "Explore rural opportunities without middlemen or commissions."
            )}
          </p>

          <div className="rcSimpleHero__actions" aria-label={t("Accesos principales", "Acessos principais", "Main actions")}>
            <RegionalLink href="/register" className="rcSimpleHero__action rcSimpleHero__action--primary">
              {t("Registrate gratis", "Cadastre-se grátis", "Sign up free")}
              <span aria-hidden="true">↗</span>
            </RegionalLink>

            <div className="rcSimpleHero__browse">
              <RegionalLink href="/campos" className="rcSimpleHero__action rcSimpleHero__action--secondary">
                {t("Ver campos", "Ver terras", "Browse farmland")}
                <span aria-hidden="true">↗</span>
              </RegionalLink>
              <RegionalLink href="/servicios-rurales" className="rcSimpleHero__action rcSimpleHero__action--secondary">
                {t("Ver servicios", "Ver serviços", "Browse services")}
                <span aria-hidden="true">↗</span>
              </RegionalLink>
            </div>
          </div>
        </div>

        <div className="rcSimpleHero__art" aria-label={t("Tríptico rural de campos, productores y servicios", "Tríptico rural de terras, produtores e serviços", "Rural triptych of farmland, farmers and services")}>
          {panels.map((panel, index) => (
            <div className={"rcSimpleHero__panel rcSimpleHero__panel--" + panel.css} key={panel.css}>
              <Image
                src={panel.image}
                alt=""
                fill
                priority={index === 0}
                sizes="(max-width: 700px) 50vw, (max-width: 1200px) 30vw, 32vw"
                className="rcSimpleHero__image"
              />
              <div className="rcSimpleHero__photoLabel" aria-hidden="true">
                <strong>{panel.label}</strong>
              </div>
            </div>
          ))}
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
