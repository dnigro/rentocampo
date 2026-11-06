import Image from "next/image";
import { ArrowRight, LandPlot, MessagesSquare, Tractor, UserRound, UserRoundPlus } from "lucide-react";
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
      title: t("Campos", "Terras", "Farmland"),
      description: t(
        "Buscá, explorá y conectá.",
        "Busque, explore e conecte-se.",
        "Search, explore and connect."
      ),
      href: "/campos",
      Icon: LandPlot,
    },
    {
      title: t("Productores", "Produtores", "Farmers"),
      description: t(
        "Conectá y generá oportunidades.",
        "Conecte-se e crie oportunidades.",
        "Connect and discover opportunities."
      ),
      href: "/register?tipo=productor",
      Icon: UserRound,
    },
    {
      title: t("Servicios rurales", "Serviços rurais", "Rural services"),
      description: t(
        "Ofrecé o contratá servicios.",
        "Ofereça ou contrate serviços.",
        "Offer or hire rural services."
      ),
      href: "/servicios-rurales",
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
            <p className="rcp-home__eyebrow">
              {t("EL CAMPO. SIN VUELTAS.", "O CAMPO. SEM COMPLICAÇÕES.", "RURAL CONNECTIONS. MADE SIMPLE.")}
            </p>
            <h1 className="rcp-home__title" id="rcp-home-title">
              {t("Tu tierra tiene valor.", "Sua terra tem valor.", "Your land has value.")}
              <span>{t("Agregala en el mapa.", "Coloque-a no mapa.", "Put it on the map.")}</span>
            </h1>
            <p className="rcp-home__description">
              {t(
                "Conectá con productores y servicios rurales, de forma directa y sin intermediarios.",
                "Conecte-se com produtores e serviços rurais diretamente, sem intermediários.",
                "Connect with farmers and rural services directly, with no middlemen."
              )}
            </p>
            <p className="rcp-home__direct">
              {t(
                "Mapa y chat online para hablar directo.",
                "Mapa e chat online para conversar diretamente.",
                "Map and online chat to connect directly."
              )}
            </p>
            <div className="rcp-home__proof" aria-label={t("Sin comisión y contacto directo", "Sem comissão e contato direto", "Zero commission and direct contact")}>
              <span className="rcp-home__proof-metric">
                <strong>0%</strong> {t("COMISIÓN", "COMISSÃO", "COMMISSION")}
              </span>
              <span className="rcp-home__proof-divider" aria-hidden="true" />
              <span className="rcp-home__proof-contact">
                <MessagesSquare aria-hidden="true" size={23} strokeWidth={1.9} />
                {t("MAPA + CHAT ONLINE", "MAPA + CHAT ONLINE", "MAP + ONLINE CHAT")}
              </span>
            </div>
            <div className="rcp-home__buttons">
              <RegionalLink href="/register" fallbackCountry={country} className="rcp-home__button rcp-home__button--register">
                <UserRoundPlus aria-hidden="true" size={20} strokeWidth={2} />
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
          <span className="rcp-home__heading-rule" aria-hidden="true" />
          <h2 id="rcp-home-options-title">{t("¿Qué necesitás hoy?", "O que você procura?", "What brings you here?")}</h2>
          <span className="rcp-home__heading-rule" aria-hidden="true" />
        </div>
        <div className="rcp-home__choice-grid">
          {choices.map(({ title, description, href, Icon }) => (
            <RegionalLink key={title} href={href} fallbackCountry={country} className="rcp-home__choice">
              <Icon className="rcp-home__choice-icon" strokeWidth={1.7} size={36} aria-hidden="true" />
              <div className="rcp-home__choice-copy">
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
              <span className="rcp-home__choice-arrow" aria-hidden="true"><ArrowRight size={22} /></span>
            </RegionalLink>
          ))}
        </div>
      </section>
    </div>
  );
}
