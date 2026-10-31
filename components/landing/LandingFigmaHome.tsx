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
    <>
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
            {t("EL CAMPO ES DE QUIEN LO HACE", "O CAMPO É DE QUEM O FAZ", "THE LAND BELONGS TO THOSE WHO WORK IT")}
          </p>
          <h1 id="rcf-hero-title" className="rcf-hero__title">
            <span>{t("EL CAMPO.", "O CAMPO.", "RURAL LIFE.")}</span>
            <span>{t("SIN VUELTAS.", "SEM COMPLICAÇÕES.", "MADE SIMPLE.")}</span>
          </h1>
          <span className="rcf-rule" aria-hidden="true" />
          <p className="rcf-hero__description">
            {t(
              "Publicá, buscá y conectá. Sin intermediarios. Sin comisiones.",
              "Anuncie, encontre e conecte-se. Sem intermediários. Sem comissões.",
              "List, explore and connect. No middlemen. No commissions.",
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
          <div className="rcf-hero__proof" aria-label={t("Beneficios", "Benefícios", "Benefits")}>
            <span>{t("0% COMISIONES", "0% COMISSÕES", "0% COMMISSION")}</span>
            <span className="rcf-hero__divider" aria-hidden="true" />
            <span>{t("CONTACTO DIRECTO", "CONTATO DIRETO", "DIRECT CONTACT")}</span>
          </div>
        </div>
      </section>

      <section className="rcf-doors" aria-labelledby="rcf-doors-title">
        <div className="rcf-container">
          <p className="rcf-eyebrow rcf-eyebrow--dark">
            {t("SIMPLE DESDE EL PRIMER CLIC", "SIMPLES DESDE O PRIMEIRO CLIQUE", "SIMPLE FROM THE FIRST CLICK")}
          </p>
          <h2 className="rcf-doors__title" id="rcf-doors-title">
            {t("¿QUÉ QUERÉS HACER?", "O QUE VOCÊ QUER FAZER?", "WHAT WOULD YOU LIKE TO DO?")}
          </h2>
          <p className="rcf-doors__lead">
            {t("Elegí una opción. El contacto es directo.", "Escolha uma opção. O contato é direto.", "Choose a path. Connect directly.")}
          </p>

          <div className="rcf-door-grid">
            <article className="rcf-door rcf-door--search">
              <Image
                src="/image_vaca_pix.png"
                alt=""
                fill
                sizes="(max-width: 800px) 100vw, 50vw"
                className="rcf-cover rcf-cover--cattle"
              />
              <div className="rcf-door__body">
                <span className="rcf-door__label">{t("01  ENCONTRAR", "01  ENCONTRAR", "01  FIND")}</span>
                <h3>{t("BUSCÁ.", "BUSQUE.", "EXPLORE.")}</h3>
                <p>{t("Campos y servicios rurales. Elegí lo que necesitás.", "Terras e serviços rurais. Encontre o que precisa.", "Land and rural services. Find what you need.")}</p>
                <RegionalLink href="/campos/mapa" className="rcf-pill rcf-pill--light">
                  {t("Explorar oportunidades", "Explorar oportunidades", "Explore opportunities")}
                </RegionalLink>
              </div>
            </article>
            <article className="rcf-door rcf-door--publish">
              <Image
                src="/rentocampo-hero-campo-bn-1920x1080.webp"
                alt=""
                fill
                sizes="(max-width: 800px) 100vw, 50vw"
                className="rcf-cover rcf-cover--land"
              />
              <div className="rcf-door__body">
                <span className="rcf-door__label">{t("02  OFRECER", "02  OFERECER", "02  OFFER")}</span>
                <h3>{t("PUBLICÁ.", "ANUNCIE.", "LIST IT.")}</h3>
                <p>{t("Un campo o un servicio. Dalo a conocer gratis.", "Uma terra ou serviço. Anuncie gratuitamente.", "Land or a service. List it for free.")}</p>
                <RegionalLink href="/register" className="rcf-pill rcf-pill--dark">
                  {t("Publicar gratis", "Anunciar grátis", "List for free")}
                </RegionalLink>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="rcf-zero" aria-labelledby="rcf-zero-title">
        <div className="rcf-container rcf-zero__inner">
          <p className="rcf-eyebrow">{t("VOS CERRÁS EL TRATO", "VOCÊ FECHA O NEGÓCIO", "YOU CLOSE THE DEAL")}</p>
          <div className="rcf-zero__layout">
            <strong className="rcf-zero__number">0%</strong>
            <div>
              <h2 id="rcf-zero-title">
                {t("COMISIONES.", "COMISSÕES.", "COMMISSIONS.")}
                <br />
                {t("CONTACTO DIRECTO.", "CONTATO DIRETO.", "DIRECT CONTACT.")}
              </h2>
              <p>{t("Vos publicás. Vos contactás. Vos acordás.", "Você anuncia. Você conversa. Você combina.", "You list. You connect. You agree.")}</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
