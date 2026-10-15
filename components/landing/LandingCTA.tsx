import RegionalLink from "@/components/layout/RegionalLink";
import { cookies } from "next/headers";
import { resolveCountry } from "@/data/countries";
export default async function LandingCTA() {
  const country = resolveCountry((await cookies()).get("rentocampo_country")?.value);
  return <section className="rc-final"><div className="rc-shell"><p className="rc-kicker">Tu próxima oportunidad empieza acá</p><h2>Poné tu campo<br />en movimiento.</h2><RegionalLink href="/register?tipo=propietario" fallbackCountry={country} className="rc-button rc-button-yellow">Publicar gratis →</RegionalLink></div></section>;
}
