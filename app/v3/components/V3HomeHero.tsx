import Image from "next/image";
import { ArrowDown } from "lucide-react";
import type { CountryCode } from "@/data/countries";
import { regionalText } from "@/lib/i18n/regional";
export default function V3HomeHero({ country }: {
    country: CountryCode;
}) {
    const t = (es: string, pt: string, en: string) => regionalText(country, es, pt, en);
    return (<section className="rural-hero-band" aria-labelledby="v3-home-title">
      <div className="rural-hero">
        <div className="rural-hero-copy">
          <span className="v3-kicker">{t("TIERRA. PERSONAS. OPORTUNIDADES.", "TERRA. PESSOAS. OPORTUNIDADES.", "LAND. PEOPLE. OPPORTUNITIES.")}</span>
          <h1 id="v3-home-title">
            {t("Todo el campo.", "Todo o campo.", "All the countryside.")}<br />
            {t("En un lugar.", "Em um só lugar.", "In one place.")}
          </h1>
          <p>{t("Encontrá campos y servicios rurales. Elegí tu zona y conectá con tu próxima oportunidad.", "Encontre terras e serviços rurais. Escolha sua região e conecte-se à sua próxima oportunidade.", "Find farmland and rural services. Choose your area and connect with your next opportunity.")}</p>
          <a href="#explorar" className="rural-hero-link">
            {t("Explorá tu zona", "Explore sua região", "Explore your area")} <ArrowDown size={18} aria-hidden="true"/>
          </a>
          <span className="rural-direct">{t("Contacto directo · Sin intermediarios · Sin comisiones", "Contato direto · Sem intermediários · Sem comissões", "Direct contact · No intermediaries · No commissions")}</span>
        </div>
        <div className="rural-hero-image">
          <Image src="/image_vaca_pix.png" alt={t("Ganado en el campo", "Gado no campo", "Cattle in the countryside")} fill priority sizes="(max-width:700px) 90vw,45vw"/>
        </div>
      </div>
    </section>);
}
