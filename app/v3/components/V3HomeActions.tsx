import Link from "@/components/layout/SiteLink";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import type { CountryCode } from "@/data/countries";
import { regionalText } from "@/lib/i18n/regional";
import { homeFAQContent } from "@/data/home-faq";
import RuralIcon from "./RuralIcon";
export default function V3HomeActions({ country }: {
    country: CountryCode;
}) {
    const t = (es: string, pt: string, en: string) => regionalText(country, es, pt, en);
    const actions = [
        {
            icon: "campo",
            title: t("Busco un campo", "Procuro uma terra", "Find farmland"),
            text: t("Elegí tu zona y explorá las publicaciones.", "Escolha sua região e explore os anúncios.", "Choose an area and explore listings."),
            cta: t("Explorar campos", "Explorar terras", "Explore farmland"),
            href: `/v3?pais=${country}&tipo=campo#explorar`,
        },
        {
            icon: "operacion",
            title: t("Tengo un campo", "Tenho uma terra", "List my farmland"),
            text: t("Prepará tu publicación y contá qué ofrecés.", "Prepare seu anúncio e conte o que oferece.", "Prepare a listing and share what you offer."),
            cta: t("Publicar campo", "Anunciar terra", "List farmland"),
            href: `/mis-campos/nuevo?pais=${country}`,
        },
        {
            icon: "servicio",
            title: t("Ofrezco servicios", "Ofereço serviços", "Offer services"),
            text: t("Mostrá qué hacés y en qué zonas trabajás.", "Mostre o que faz e onde trabalha.", "Show what you do and where you work."),
            cta: t("Ofrecer servicios", "Oferecer serviços", "Offer services"),
            href: `/mis-servicios-rurales/nuevo?pais=${country}`,
        },
    ];
    return (<section className="rural-home-actions" id="como-funciona" aria-labelledby="rural-actions-title">
      <div className="rural-actions-heading">
        <h2 id="rural-actions-title">{t("¿Qué necesitás hoy?", "O que você precisa hoje?", "What do you need today?")}</h2>
        <p>{t("Elegí cómo querés usar RentoCampo.", "Escolha como quer usar a RentoCampo.", "Choose how you want to use RentoCampo.")}</p>
      </div>
      <div className="rural-actions-grid">
        {actions.map((action) => (<Link className="rural-action-card" href={action.href} key={action.icon}>
            <RuralIcon name={action.icon} size={25}/>
            <div><h3>{action.title}</h3><p>{action.text}</p></div>
            <span>{action.cta} <ArrowUpRight size={15} aria-hidden="true"/></span>
          </Link>))}
      </div>
      <details className="rural-home-faq">
        <summary>{t("Preguntas frecuentes", "Perguntas frequentes", "Frequently asked questions")} <ChevronDown size={20} aria-hidden="true"/></summary>
        <div className="rural-home-faq-items">
          {homeFAQContent(country).items.map((item) => (<details name="rural-home-question" key={item.question}>
              <summary>{item.question}<span aria-hidden="true">+</span></summary>
              <p>{item.answer}</p>
            </details>))}
        </div>
      </details>
    </section>);
}
