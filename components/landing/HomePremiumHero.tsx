import Image from "next/image";
import { ArrowUpRight, LandPlot, MapPinned, Handshake, Tractor, UserRoundPlus } from "lucide-react";
import RegionalLink from "@/components/layout/RegionalLink";
import { regionalText } from "@/lib/i18n/regional";
import type { CountryCode } from "@/data/countries";
import "@/styles/home-premium.css";

/**
 * Variante minimalista web del 6/11/2026, con fotografía B/N a la derecha.
 * Tres accesos de texto sin imágenes secundarias ni elementos duplicados.
 * App Lite conserva SimpleMapChatHero(lite=true), sin modificar sus flujos.
 */
export default function HomePremiumHero({ country }: { country: CountryCode }) {
  const t = (es: string, pt: string, en: string) => regionalText(country, es, pt, en);

  const choices = [
    {
      title: t("Busco un campo", "Procuro terras", "I’m looking for farmland"),
      description: t(
        "Explorá tierras disponibles y elegí la zona en el mapa.",
        "Explore as terras disponíveis e escolha uma região no mapa.",
        "Explore available farmland and choose an area on the map."
      ),
      cta: t("Explorar campos", "Explorar terras", "Explore farmland"),
      href: "/campos",
      Icon: LandPlot,
    },
    {
      title: t("Tengo un campo", "Tenho uma propriedade", "I own farmland"),
      description: t(
        "Publicá tu tierra y recibí consultas directamente.",
        "Anuncie sua propriedade e receba contatos diretamente.",
        "List your land and receive inquiries directly."
      ),
      cta: t("Publicar campo", "Anunciar terra", "List farmland"),
      href: "/register?tipo=propietario",
      Icon: MapPinned,
    },
    {
      title: t("Ofrezco servicios", "Ofereço serviços", "I offer rural services"),
      description: t(
        "Mostrá qué hacés y en qué zonas trabajás.",
        "Mostre seus serviços e as regiões onde você trabalha.",
        "Show what you do and where you work."
      ),
      cta: t("Ofrecer servicios", "Oferecer serviços", "Offer services"),
      href: "/register?tipo=prestador",
      Icon: Tractor,
    },
  ] as const;

  return (
    <div className="rcp-home" id="hero">
      <section className="rcp-home__frame" aria-labelledby="rcp-home-title">
        <div className="rcp-home__hero">
          <div className="rcp-home__visual" aria-hidden="true">
            <Image
              src="/image_vaca_pix.png"
              alt=""
              fill
              priority
              sizes="(max-width: 700px) 100vw, 60vw"
              className="rcp-home__image"
            />
          </div>

          <div className="rcp-home__content">
            <h1 className="rcp-home__title" id="rcp-home-title">
              <span>{t("Todo el campo.", "Todo o campo.", "All things rural.")}</span>
              <span className="rcp-home__title-accent">{t("En un solo lugar.", "Em um só lugar.", "In one place.")}</span>
            </h1>
            <p className="rcp-home__description">
              {t(
                "Campos, productores y servicios.",
                "Terras, produtores e serviços.",
                "Land, producers and services."
              )}
            </p>
            <div className="rcp-home__proof rcp-home__proof--concept06" aria-label={t("Publicación gratis, contacto directo y cero comisión", "Anúncios grátis, contato direto e zero comissão", "Free listings, direct contact and zero commission")}>
              <span className="rcp-home__proof-contact"><Tractor aria-hidden="true" size={26} strokeWidth={1.8} />{t("PUBLICACIÓN GRATIS", "ANÚNCIO GRÁTIS", "FREE LISTINGS")}</span>
              <span className="rcp-home__proof-divider" aria-hidden="true" />
              <span className="rcp-home__proof-contact"><Handshake aria-hidden="true" size={26} strokeWidth={1.8} />{t("CONTACTO DIRECTO", "CONTATO DIRETO", "DIRECT CONTACT")}</span>
              <span className="rcp-home__proof-divider" aria-hidden="true" />
              <span className="rcp-home__proof-metric"><strong>0%</strong> {t("COMISIÓN", "COMISSÃO", "COMMISSION")}</span>
            </div>
            <div className="rcp-home__buttons">
              <RegionalLink href="/register" fallbackCountry={country} className="rcp-home__button rcp-home__button--register">
                <UserRoundPlus aria-hidden="true" size={20} strokeWidth={2} />
                {t("REGISTRATE GRATIS", "CADASTRE-SE GRÁTIS", "SIGN UP FREE")}
              </RegionalLink>
              <RegionalLink href="/campos/mapa" fallbackCountry={country} className="rcp-home__map-link">
                <MapPinned aria-hidden="true" size={21} />
                {t("EXPLORAR MAPA", "EXPLORAR MAPA", "EXPLORE MAP")}
                <ArrowUpRight aria-hidden="true" size={17} />
              </RegionalLink>
            </div>
          </div>
        </div>
      </section>

      <section className="rcp-home__choices" aria-labelledby="rcp-home-options-title">
        <div className="rcp-home__choices-heading">
          <p className="rcp-home__choices-kicker">
            {t("EL CAMPO. SIN VUELTAS.", "O CAMPO. SEM COMPLICAÇÕES.", "RURAL CONNECTIONS. MADE SIMPLE.")}
          </p>
          <div className="rcp-home__choices-heading-line">
            <h2 id="rcp-home-options-title">{t("¿Qué necesitás hoy?", "O que você procura?", "What brings you here?")}</h2>
            <p>{t("Elegí cómo querés usar RentoCampo.", "Escolha como usar a RentoCampo.", "Choose how you want to use RentoCampo.")}</p>
          </div>
        </div>
        <div className="rcp-home__choice-grid">
          {choices.map(({ title, description, cta, href, Icon }) => (
            <RegionalLink key={title} href={href} fallbackCountry={country} className="rcp-home__choice">
              <Icon className="rcp-home__choice-icon" strokeWidth={1.85} size={31} aria-hidden="true" />
              <div className="rcp-home__choice-copy">
                <h3>{title}</h3>
                <p>{description}</p>
                <span className="rcp-home__choice-cta">{cta} <ArrowUpRight size={17} aria-hidden="true" /></span>
              </div>
            </RegionalLink>
          ))}
        </div>
      </section>
    </div>
  );
}
