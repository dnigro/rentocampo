"use client";

import RegionalLink from "@/components/layout/RegionalLink";
import { regionalText } from "@/lib/i18n/regional";
import { useRegionalCountry } from "@/lib/i18n/useRegionalCountry";

export default function LandingCTA() {
  const country = useRegionalCountry();
  const t = (es: string, pt: string) => regionalText(country, es, pt);
  return <section className="rc-final"><div className="rc-shell">
    <p className="rc-kicker">{t("Tu próxima oportunidad empieza acá", "Sua próxima oportunidade começa aqui")}</p>
    <h2>{t("Poné tu campo", "Coloque sua terra")}<br />{t("en movimiento.", "em movimento.")}</h2>
    <RegionalLink href="/register?tipo=propietario" fallbackCountry={country} className="rc-button rc-button-yellow">{t("Publicar gratis →", "Anunciar gratuitamente →")}</RegionalLink>
  </div></section>;
}
