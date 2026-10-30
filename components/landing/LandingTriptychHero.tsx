"use client";

import Image from "next/image";
import { ArrowRight, MapPin, Tractor, Wrench } from "lucide-react";
import RegionalLink from "@/components/layout/RegionalLink";
import cowPhoto from "@/public/image_vaca_pix.png";
import { regionalText } from "@/lib/i18n/regional";
import { useRegionalCountry } from "@/lib/i18n/useRegionalCountry";
import "@/styles/home-option2.css";

/**
 * Opción 2 aprobada para revisión: un solo hero con tres cajitas.
 * Mantiene el recurso ganadero existente sin introducir imágenes con texto incrustado.
 * El tríptico y los tres pasos quedan fuera del render.
 */
export default function LandingTriptychHero() {
  const country = useRegionalCountry();
  const t = (es: string, pt: string, en?: string) => regionalText(country, es, pt, en);

  const categories = [
    {
      href: "/register?tipo=productor",
      label: t("PRODUCTORES", "PRODUTORES", "FARMERS"),
      Icon: Tractor,
    },
    {
      href: "/campos",
      label: t("TIERRA", "TERRA", "LAND"),
      Icon: MapPin,
    },
    {
      href: "/servicios-rurales",
      label: t("SERVICIOS", "SERVIÇOS", "SERVICES"),
      Icon: Wrench,
    },
  ];

  return (
    <section className="rcOption2" id="hero" aria-labelledby="rcOption2-title">
      <div className="rcOption2__photo" aria-hidden="true">
        <Image
          src={cowPhoto}
          alt=""
          fill
          priority
          placeholder="blur"
          sizes="(max-width: 900px) 78vw, 65vw"
          className="rcOption2__cow"
        />
      </div>

      <div className="rcOption2__content">
        <p className="rcOption2__eyebrow">{t("CONECTAMOS EL CAMPO", "CONECTAMOS O CAMPO")}</p>

        <h1 className="rcOption2__title" id="rcOption2-title">
          <span className="rcOption2__big">{t("SIN", "SEM", "NO")}</span>
          <span className="rcOption2__titleSecond">{t("INTERMEDIARIOS.", "INTERMEDIÁRIOS.", "MIDDLEMEN.")}</span>
        </h1>

        <p className="rcOption2__claim">{t("MAPAS + CHAT ONLINE", "MAPAS + CHAT ONLINE", "MAPS + ONLINE CHAT")}</p>

        <div className="rcOption2__categories" aria-label={t("Productores, tierra y servicios", "Produtores, terras e serviços", "Farmers, land and services")}>
          {categories.map(({ href, label, Icon }) => (
            <RegionalLink key={href} href={href} className="rcOption2__category">
              <Icon className="rcOption2__categoryIcon" size={29} strokeWidth={1.75} aria-hidden="true" />
              <span className="rcOption2__categoryLabel">{label}</span>
              <ArrowRight className="rcOption2__categoryArrow" size={17} strokeWidth={2.25} aria-hidden="true" />
            </RegionalLink>
          ))}
        </div>

        <p className="rcOption2__slogan">{t("Vos publicás. Vos contactás. Vos acordás.", "Você anuncia. Você conversa. Você combina.", "You list. You connect. You decide.")}</p>

        <div className="rcOption2__stats" aria-label={t("Sin comisiones y contacto directo", "Sem comissões e contato direto", "No commissions and direct contact")}>
          <div className="rcOption2__stat">
            <strong>0%</strong>
            <span>{t("COMISIONES.", "COMISSÕES.", "COMMISSIONS.")}</span>
          </div>
          <div className="rcOption2__stat">
            <strong>100%</strong>
            <span>{t("CONTACTO DIRECTO.", "CONTATO DIRETO.", "DIRECT CONTACT.")}</span>
          </div>
        </div>

        <RegionalLink href="/register" className="rcOption2__register">
          <span>{t("REGISTRATE GRATIS", "CADASTRE-SE GRÁTIS", "SIGN UP FREE")}</span>
          <ArrowRight size={25} strokeWidth={2.25} aria-hidden="true" />
        </RegionalLink>
      </div>
    </section>
  );
}
