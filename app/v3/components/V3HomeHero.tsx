import Image from "next/image";
import { ArrowUpRight, MapPinned, MessagesSquare, Tractor } from "lucide-react";
import type { CountryCode } from "@/data/countries";
import { regionalText } from "@/lib/i18n/regional";

export default function V3HomeHero({country}: {country: CountryCode}) {
  const t=(es:string,pt:string,en:string)=>regionalText(country,es,pt,en);
  return <section className="rural-hero-band" aria-labelledby="v3-home-title">
    <div className="rural-hero">
      <div className="rural-hero-copy">
        <span className="v3-kicker">{t("TIERRA. PERSONAS. OPORTUNIDADES.","TERRA. PESSOAS. OPORTUNIDADES.","LAND. PEOPLE. OPPORTUNITIES.")}</span>
        <h1 id="v3-home-title">{t("Todo el campo.","Todo o campo.","All the countryside.")}<br/><span className="rural-hero-impact">{t("En un lugar.","Em um só lugar.","In one place.")}</span></h1>
        <p>{t("Campos y servicios rurales. Conectá directo.","Terras e serviços rurais. Conecte-se diretamente.","Farmland and rural services. Connect directly.")}</p>
        <div className="rural-hero-benefits"><span><MapPinned size={19}/>{t("MAPA","MAPA","MAP")}</span><span><Tractor size={20}/>{t("SERVICIOS","SERVIÇOS","SERVICES")}</span><span><MessagesSquare size={20}/>{t("CONTACTO DIRECTO","CONTATO DIRETO","DIRECT CONTACT")}</span></div>
        <div className="rural-hero-actions"><a href="#explorar" className="rural-hero-link">{t("Explorar mapa","Explorar mapa","Explore map")} <ArrowUpRight size={19}/></a><a href="#como-funciona" className="rural-hero-publish">{t("Quiero publicar","Quero anunciar","Create a listing")} <ArrowUpRight size={18}/></a></div>
        <span className="rural-direct">{t("Sin intermediarios · Sin comisiones","Sem intermediários · Sem comissões","No intermediaries · No commissions")}</span>
      </div>
      <div className="rural-hero-image"><Image src="/image_vaca_pix.png" alt={t("Ganado en el campo","Gado no campo","Cattle in the countryside")} fill priority sizes="(max-width:700px) 100vw,45vw"/></div>
    </div>
  </section>;
}
