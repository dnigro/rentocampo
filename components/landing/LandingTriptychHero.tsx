"use client";

import Image from "next/image";
import RegionalLink from "@/components/layout/RegionalLink";
import cattleHero from "@/public/rentocampo-hero-campo-bn-1920x1080.webp";
import fieldsPhoto from "@/public/image_eol_pix.png";
import producersPhoto from "@/public/image_vaca_pix.png";
import servicesPhoto from "@/public/image_truck_pix.png";
import { regionalText } from "@/lib/i18n/regional";
import { useRegionalCountry } from "@/lib/i18n/useRegionalCountry";
import "@/styles/home-option3.css";

export default function LandingTriptychHero() {
  const country = useRegionalCountry();
  const t = (es: string, pt: string) => regionalText(country, es, pt);
  const panels = [
    { href: "/campos", image: fieldsPhoto, cta: t("VER CAMPOS", "VER TERRAS") },
    { href: "/register?tipo=productor", image: producersPhoto, cta: t("SOY PRODUCTOR", "SOU PRODUTOR") },
    { href: "/servicios-rurales", image: servicesPhoto, cta: t("VER SERVICIOS", "VER SERVIÇOS") },
  ];

  return (
    <section className="rcHome3" id="hero" aria-labelledby="rcHome3-title">
      <div className="rcHome3__stage">
        <div className="rcHome3__visual" aria-hidden="true">
          <Image src={cattleHero} alt="" fill priority placeholder="blur" sizes="(max-width: 900px) 100vw, 70vw" className="rcHome3__heroImage" />
        </div>
        <div className="rcHome3__copy">
          <p className="rcHome3__eyebrow">{t("CONECTAMOS EL CAMPO", "CONECTAMOS O CAMPO")}</p>
          <h1 className="rcHome3__heading" id="rcHome3-title">
            <span className="rcHome3__lead">{t("SIN", "SEM")}</span>
            <span className="rcHome3__word">{t("INTERMEDIARIOS.", "INTERMEDIÁRIOS.")}</span>
          </h1>
          <div className="rcHome3__features" aria-label={t("Mapas, chat, productores, tierras y servicios", "Mapas, chat, produtores, terras e serviços")}>
            <p className="rcHome3__featureMain">{t("MAPAS + CHAT ONLINE", "MAPAS + CHAT ONLINE")}</p>
            <p className="rcHome3__featureSub">{t("Productores + Tierra + Servicios", "Produtores + Terras + Serviços")}</p>
          </div>
          <p className="rcHome3__statement">{t("Vos publicás. Vos contactás. Vos acordás.", "Você anuncia. Você conversa. Você combina.")}</p>
          <div className="rcHome3__stats" aria-label={t("Sin comisiones y contacto directo", "Sem comissões e contato direto")}>
            <div className="rcHome3__stat"><strong>0%</strong><span>{t("COMISIONES.", "COMISSÕES.")}</span></div>
            <div className="rcHome3__stat"><strong>100%</strong><span>{t("CONTACTO DIRECTO.", "CONTATO DIRETO.")}</span></div>
          </div>
          <RegionalLink href="/register" className="rcHome3__cta">
            <span>{t("REGISTRATE GRATIS", "CADASTRE-SE GRÁTIS")}</span>
            <span aria-hidden="true">→</span>
          </RegionalLink>
        </div>
      </div>
      <div className="rcHome3__triptych" aria-label={t("Explorá RentoCampo", "Explore a RentoCampo")}>
        {panels.map((panel) => (
          <RegionalLink href={panel.href} key={panel.href} className="rcHome3__panel" aria-label={panel.cta}>
            <Image src={panel.image} alt="" fill sizes="(max-width: 900px) 40vw, 36vw" className="rcHome3__panelImage" />
            <span className="rcHome3__panelShade" aria-hidden="true" />
            <span className="rcHome3__panelButton">{panel.cta}</span>
          </RegionalLink>
        ))}
      </div>
    </section>
  );
}
