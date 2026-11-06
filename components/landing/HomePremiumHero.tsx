import Image from "next/image";
import { ArrowUpRight, LandPlot, MapPinned, MessagesSquare, Tractor, UserRoundPlus } from "lucide-react";
import RegionalLink from "@/components/layout/RegionalLink";
import { regionalText } from "@/lib/i18n/regional";
import type { CountryCode } from "@/data/countries";
import "@/styles/home-premium.css";

/**
 * Portada web premium, alineada visualmente con /us y /br.
 * La App Lite mantiene intacto SimpleMapChatHero(lite=true).
 * Conserva el flujo regional de registro, publicaciones, mapas y servicios.
 */
export default function HomePremiumHero({ country }: { country: CountryCode }) {
  const t = (es: string, pt: string, en: string) => regionalText(country, es, pt, en);

  const actions = [
    {
      title: t("Busco un campo", "Procuro terras", "I'm looking for farmland"),
      description: t(
        "Explorá tierras disponibles y elegí la zona en el mapa.",
        "Explore terras disponíveis e escolha a região no mapa.",
        "Explore farmland listings and choose an area on the map."
      ),
      cta: t("Explorar campos", "Explorar terras", "Explore farmland"),
      href: "/campos",
      Icon: LandPlot,
    },
    {
      title: t("Tengo un campo", "Tenho uma propriedade", "I own land"),
      description: t(
        "Publicá tu tierra y recibí consultas directamente.",
        "Anuncie sua propriedade e receba contatos diretamente.",
        "List your property and receive inquiries directly."
      ),
      cta: t("Publicar campo", "Anunciar terra", "List farmland"),
      href: "/register?tipo=propietario",
      Icon: MapPinned,
    },
    {
      title: t("Ofrezco servicios", "Ofereço serviços", "I offer rural services"),
      description: t(
        "Mostrá qué hacés y en qué zonas trabajás.",
        "Mostre seus serviços e as regiões onde você atua.",
        "Show what you offer and the areas you serve."
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
          <div className="rcp-home__visual">
            <Image
              src="/image_vaca_pix.png"
              alt=""
              fill
              priority
              sizes="(max-width: 700px) 100vw, 60vw"
              className="rcp-home__image"
            />
            <div className="rcp-home__visual-fade" aria-hidden="true" />
          </div>
          <div className="rcp-home__content">
            <p className="rcp-home__eyebrow">
              {t("CAMPOS · PRODUCTORES · SERVICIOS RURALES", "TERRAS · PRODUTORES · SERVIÇOS RURAIS", "FARMLAND · FARMERS · RURAL SERVICES")}
            </p>
            <h1 className="rcp-home__title" id="rcp-home-title">
              {t("Tu tierra tiene valor.", "Sua terra tem valor.", "Your land has value.")}
              <span>{t("Agregala en el mapa.", "Coloque-a no mapa.", "Put it on the map.")}</span>
            </h1>
            <p className="rcp-home__description">
              {t(
                "Buscá, publicá y conectá con productores y servicios rurales.",
                "Busque, anuncie e conecte-se com produtores e prestadores de serviços rurais.",
                "Discover farmland, post listings and connect with farmers and rural services."
              )}
            </p>
            <p className="rcp-home__direct">
              {t(
                "Mapa y chat online para hablar directamente, sin intermediarios.",
                "Mapa e chat online para conversar diretamente, sem intermediários.",
                "Map and online chat to connect directly, without intermediaries."
              )}
            </p>
            <div className="rcp-home__proof" aria-label={t("Sin comisión y contacto directo", "Sem comissão e contato direto", "Zero commission and direct contact")}>
              <span className="rcp-home__proof-metric"><strong>0%</strong> {t("COMISIÓN", "COMISSÃO", "COMMISSION")}</span>
              <span className="rcp-home__proof-divider" aria-hidden="true" />
              <span className="rcp-home__proof-contact"><MessagesSquare aria-hidden="true" size={20} strokeWidth={1.9} /> {t("MAPA + CHAT ONLINE", "MAPA + CHAT ONLINE", "MAP + ONLINE CHAT")}</span>
            </div>
            <div className="rcp-home__buttons">
              <RegionalLink href="/register" fallbackCountry={country} className="rcp-home__button rcp-home__button--register">
                <UserRoundPlus aria-hidden="true" size={19} strokeWidth={2.1} />
                {t("REGISTRATE GRATIS", "CADASTRE-SE GRÁTIS", "SIGN UP FREE")}
              </RegionalLink>
              <RegionalLink href="/register?tipo=propietario" fallbackCountry={country} className="rcp-home__button rcp-home__button--outline">
                {t("PUBLICAR CAMPO", "ANUNCIAR TERRA", "LIST FARMLAND")}
              </RegionalLink>
              <RegionalLink href="/register?tipo=prestador" fallbackCountry={country} className="rcp-home__button rcp-home__button--outline">
                {t("OFRECER SERVICIOS", "OFERECER SERVIÇOS", "OFFER SERVICES")}
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
          <h2 id="rcp-home-options-title">{t("¿Qué necesitás hoy?", "O que você procura?", "What brings you here?")}</h2>
          <p>{t("Elegí cómo querés usar RentoCampo.", "Escolha como quer usar a RentoCampo.", "Choose how you'd like to use RentoCampo.")}</p>
        </div>
        <div className="rcp-home__choice-grid">
          {actions.map(({ title, description, cta, href, Icon }) => (
            <RegionalLink key={title} href={href} fallbackCountry={country} className="rcp-home__choice">
              <Icon className="rcp-home__choice-icon" strokeWidth={1.8} size={28} aria-hidden="true" />
              <h3>{title}</h3>
              <p>{description}</p>
              <span>{cta} <ArrowUpRight aria-hidden="true" size={16} /></span>
            </RegionalLink>
          ))}
        </div>
        <div className="rcp-home__explore">
          <RegionalLink href="/campos/mapa" fallbackCountry={country} className="rcp-home__map-link">
            <MapPinned aria-hidden="true" size={19} />
            {t("Explorar oportunidades en el mapa", "Explorar oportunidades no mapa", "Explore opportunities on the map")}
            <ArrowUpRight aria-hidden="true" size={16} />
          </RegionalLink>
        </div>
      </section>
    </div>
  );
}
