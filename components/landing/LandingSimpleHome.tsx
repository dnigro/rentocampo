"use client";

import Image from "next/image";
import RegionalLink from "@/components/layout/RegionalLink";
import { useRegionalCountry } from "@/lib/i18n/useRegionalCountry";
import { regionalText } from "@/lib/i18n/regional";
import fields from "@/public/image_trigo_pix.png";
import services from "@/public/image_truck_pix.png";

/**
 * Home Dos Puertas: explorar campos o servicios sin registro obligatorio.
 * Respeta el navbar oficial y las rutas públicas regionales existentes.
 */
export default function LandingSimpleHome() {
  const country = useRegionalCountry();
  const t = (es: string, pt: string, en: string) => regionalText(country, es, pt, en);

  const doors = [
    {
      id: "campos",
      href: "/campos",
      image: fields,
      label: t("VER CAMPOS", "VER TERRAS", "BROWSE FARMLAND"),
      alt: t("Campo de trigo", "Campo de trigo", "Wheat field"),
    },
    {
      id: "servicios",
      href: "/servicios-rurales",
      image: services,
      label: t("VER SERVICIOS", "VER SERVIÇOS", "BROWSE SERVICES"),
      alt: t("Maquinaria agrícola trabajando en el campo", "Máquina agrícola trabalhando no campo", "Farm machinery working in the field"),
    },
  ];

  return (
    <main className="rcDoorsHome">
      <section className="rcDoorsHero" id="hero" aria-labelledby="rc-doors-title">
        <div className="rcDoorsIntro">
          <p className="rcDoorsEyebrow">
            {t("CAMPOS · PRODUCTORES · SERVICIOS", "TERRAS · PRODUTORES · SERVIÇOS", "FARMLAND · FARMERS · SERVICES")}
          </p>
          <h1 id="rc-doors-title" className="rcDoorsTitle">
            {t("¿Qué buscás", "O que você procura", "What are you looking")}
            <span>{t("en el campo?", "no campo?", "for in the countryside?")}</span>
          </h1>
          <p className="rcDoorsSubtitle">
            {t("Accedé directamente, sin intermediarios.", "Acesse diretamente, sem intermediários.", "Connect directly, without middlemen.")}
          </p>
        </div>

        <nav className="rcDoorsGrid" aria-label={t("Explorar campos o servicios", "Explorar terras ou serviços", "Browse farmland or services")}>
          {doors.map((door, i) => (
            <RegionalLink href={door.href} className={"rcDoorsTile rcDoorsTile--" + door.id} key={door.id}>
              <Image src={door.image} alt={door.alt} fill priority={i === 0}
                sizes="(max-width: 720px) 100vw, 50vw" className="rcDoorsTileImage" />
              <span className="rcDoorsTileShade" aria-hidden="true" />
              <span className="rcDoorsTileLabel">
                <strong>{door.label}</strong>
                <span className="rcDoorsTileArrow" aria-hidden="true">↗</span>
              </span>
            </RegionalLink>
          ))}
        </nav>

        <div className="rcDoorsRegisterWrap">
          <RegionalLink href="/register" className="rcDoorsRegister">
            {t("REGISTRATE GRATIS", "CADASTRE-SE GRÁTIS", "SIGN UP FREE")}
            <span aria-hidden="true">→</span>
          </RegionalLink>
        </div>
      </section>
      <div className="rcDoorsTrust" id="como-funciona">
        <span>{t("0% COMISIONES", "0% COMISSÕES", "0% COMMISSIONS")}</span>
        <span className="rcDoorsTrustDot" aria-hidden="true">·</span>
        <span>{t("100% CONTACTO DIRECTO", "100% CONTATO DIRETO", "100% DIRECT CONTACT")}</span>
      </div>
    </main>
  );
}
