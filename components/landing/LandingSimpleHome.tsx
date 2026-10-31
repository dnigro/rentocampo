"use client";

import Image from "next/image";
import RegionalLink from "@/components/layout/RegionalLink";
import { useRegionalCountry } from "@/lib/i18n/useRegionalCountry";
import { regionalText } from "@/lib/i18n/regional";
import photoFields from "@/public/image_trigo_pix.png";
import photoCattle from "@/public/image_vaca_pix.png";
import photoServices from "@/public/image_truck_pix.png";

/** Home editorial: fotografía rural del proyecto y tres acciones directas. */
export default function LandingSimpleHome() {
  const country = useRegionalCountry();
  const t = (es: string, pt: string, en: string) => regionalText(country, es, pt, en);
  const panels = [
    { image: photoFields, label: t("Campos", "Terras", "Farmland"), number: "01", position: "center" },
    { image: photoCattle, label: t("Productores", "Produtores", "Farmers"), number: "02", position: "center" },
    { image: photoServices, label: t("Servicios rurales", "Serviços rurais", "Rural services"), number: "03", position: "center" },
  ];

  return (
    <main className="rcSimpleHome">
      <section className="rcSimpleHero" id="hero" aria-labelledby="rc-simple-title">
        <div className="rcSimpleHero__content">
          <p className="rcSimpleHero__eyebrow">
            <span aria-hidden="true" className="rcSimpleHero__rule" />
            {t("RentoCampo · mercado rural", "RentoCampo · mercado rural", "RentoCampo · rural marketplace")}
          </p>
          <h1 className="rcSimpleHero__title" id="rc-simple-title">
            {t("El campo,", "O campo,", "The countryside,")}
            <span>{t("sin vueltas.", "sem complicações.", "without the hassle.")}</span>
          </h1>
          <p className="rcSimpleHero__description">
            {t("Encontrá campos y servicios rurales. Contactá directamente.", "Encontre terras e serviços rurais. Fale diretamente.", "Find farmland and rural services. Connect directly.")}
          </p>
          <div className="rcSimpleHero__actions" aria-label={t("Accesos principales", "Acessos principais", "Main actions")}>
            <RegionalLink href="/register" className="rcSimpleHero__action rcSimpleHero__action--primary">
              {t("Registrate gratis", "Cadastre-se grátis", "Sign up free")}
              <span aria-hidden="true">↗</span>
            </RegionalLink>
            <div className="rcSimpleHero__browse">
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
        </div>
        <div className="rcSimpleHero__art" aria-label={t("Campos, productores y servicios rurales", "Terras, produtores e serviços rurais", "Farmland, farmers and rural services")}>
          {panels.map((panel, index) => (
            <div className="rcSimpleHero__panel" key={panel.number}>
              <Image
                src={panel.image}
                alt=""
                fill
                priority={index === 0}
                sizes="(max-width: 700px) 34vw, 20vw"
                className="rcSimpleHero__image"
              />
              <div className="rcSimpleHero__photoLabel" aria-hidden="true">
                <span>{panel.number}</span><strong>{panel.label}</strong>
              </div>
            </div>
          ))}
          <div className="rcSimpleHero__artMark" aria-hidden="true">RC / 19</div>
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
