import Image from "next/image";
import { ArrowUpRight, MapPinned } from "lucide-react";
import type { CountryCode } from "@/data/countries";
import { regionalText } from "@/lib/i18n/regional";

export default function V3HomeHero({country}: {country: CountryCode}) {
  const t=(es:string,pt:string,en:string)=>regionalText(country,es,pt,en);
  return <section className="rural-hero-band" aria-labelledby="v3-home-title">
    <div className="rural-hero">
      <div className="rural-hero-copy">
        <span className="v3-kicker">{t("CAMPOS · SERVICIOS · PERSONAS","TERRAS · SERVIÇOS · PESSOAS","FARMLAND · SERVICES · PEOPLE")}</span>
        <h1 id="v3-home-title">{t("Conectá","Conecte-se","Connect")}<br/><span className="rural-hero-impact">{t("con el campo","com o campo","with the countryside")}</span></h1>
        <p>{t("Tu próxima oportunidad empieza con un contacto.","Sua próxima oportunidade começa com um contato.","Your next opportunity starts with a connection.")}</p>

        <div className="rural-hero-actions"><a href="#explorar" className="rural-hero-link"><MapPinned size={18}/>{t("Explorar mapa","Explorar mapa","Explore map")}</a><a href="#como-funciona" className="rural-hero-publish">{t("Quiero publicar","Quero anunciar","Create a listing")} <ArrowUpRight size={18}/></a></div>
        <span className="rural-direct">{t("Sin intermediarios · Sin comisiones","Sem intermediários · Sem comissões","No intermediaries · No commissions")}</span>
      </div>
      <div className="rural-hero-image"><Image src="/image_vaca_pix.png" alt={t("Ganado en el campo","Gado no campo","Cattle in the countryside")} fill priority sizes="(max-width:700px) 100vw,45vw"/></div>
    </div>
  </section>;
}
