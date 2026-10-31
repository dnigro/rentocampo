"use client";

import Image from "next/image";
import RegionalLink from "@/components/layout/RegionalLink";
import { useRegionalCountry } from "@/lib/i18n/useRegionalCountry";
import { regionalText } from "@/lib/i18n/regional";
import photoFields from "@/public/image_trigo_pix.png";
import photoCattle from "@/public/image_vaca_pix.png";
import photoServices from "@/public/image_truck_pix.png";

/** Recupera identidad de la home en producción, con navegación acotada a tres acciones. */
export default function LandingSimpleHome() {
  const country = useRegionalCountry();
  const t = (es: string, pt: string, en: string) => regionalText(country, es, pt, en);
  const panels = [
    { image: photoFields, name: t("Campos", "Terras", "Farmland"), id: "fields" },
    { image: photoCattle, name: t("Productores", "Produtores", "Farmers"), id: "producers" },
    { image: photoServices, name: t("Servicios rurales", "Serviços rurais", "Rural services"), id: "services" },
  ];

  return (
    <main className="rcSimpleHome">
      <section className="rcSimpleHero" id="hero" aria-labelledby="rc-simple-title">
        <div className="rcSimpleHero__content">
          <p className="rcSimpleHero__eyebrow">
            {t("CONECTAMOS EL CAMPO", "CONECTAMOS O CAMPO", "CONNECTING THE COUNTRYSIDE")}
          </p>
          <h1 className="rcSimpleHero__title" id="rc-simple-title">
            <span className="rcSimpleHero__lead">{t("SIN", "SEM", "NO")}</span>
            <span className="rcSimpleHero__impact">{t("INTERMEDIARIOS.", "INTERMEDIÁRIOS.", "MIDDLEMEN.")}</span>
          </h1>
          <div className="rcSimpleHero__features">
            <p className="rcSimpleHero__featurePrimary">
              {t("MAPAS + CHAT ONLINE", "MAPAS + CHAT ONLINE", "MAPS + ONLINE CHAT")}
            </p>
            <p className="rcSimpleHero__featureSecondary">
              {t("Productores + Tierra + Servicios", "Produtores + Terras + Serviços", "Farmers + Land + Services")}
            </p>
          </div>
          <p className="rcSimpleHero__vision">
            {t("Vos publicás. Vos contactás. Vos acordás.", "Você anuncia. Você conversa. Você combina.", "You list. You connect. You agree.")}
          </p>
          <div className="rcSimpleHero__actions" aria-label={t("Accesos principales", "Acessos principais", "Main actions")}>
            <RegionalLink href="/register" className="rcSimpleHero__action rcSimpleHero__register">
              {t("REGISTRATE GRATIS", "CADASTRE-SE GRÁTIS", "SIGN UP FREE")} <span aria-hidden="true">→</span>
            </RegionalLink>
            <div className="rcSimpleHero__browse">
              <RegionalLink href="/campos" className="rcSimpleHero__action rcSimpleHero__browseLink">
                {t("Ver campos", "Ver terras", "Browse farmland")} <span aria-hidden="true">→</span>
              </RegionalLink>
              <RegionalLink href="/servicios-rurales" className="rcSimpleHero__action rcSimpleHero__browseLink">
                {t("Ver servicios", "Ver serviços", "Browse services")} <span aria-hidden="true">→</span>
              </RegionalLink>
            </div>
          </div>
        </div>
        <div className="rcSimpleHero__art" aria-label={t("Tres imágenes del campo", "Três imagens do campo", "Three images from the countryside")}>
          {panels.map((panel, index) => (
            <div className={"rcSimpleHero__panel rcSimpleHero__panel--" + panel.id} key={panel.id}>
              <Image src={panel.image} alt="" fill priority={index === 0}
                sizes="(max-width: 900px) 55vw, 36vw" className="rcSimpleHero__image" />
              <span className="rcSimpleHero__photoLabel" aria-hidden="true">{panel.name}</span>
            </div>
          ))}
        </div>
      </section>
      <div id="como-funciona" className="rcSimpleTrust" aria-label={t("Beneficios", "Benefícios", "Benefits")}>
        <span><strong>0%</strong> {t("COMISIONES.", "COMISSÕES.", "COMMISSIONS.")}</span>
        <span><strong>100%</strong> {t("CONTACTO DIRECTO.", "CONTATO DIRETO.", "DIRECT CONTACT.")}</span>
      </div>
    </main>
  );
}
