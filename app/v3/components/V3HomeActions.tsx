import Link from "@/components/layout/SiteLink";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import type { CountryCode } from "@/data/countries";
import { regionalText } from "@/lib/i18n/regional";
import { homeFAQContent } from "@/data/home-faq";
import RuralIcon from "./RuralIcon";
export default function V3HomeActions({ country, help }: {
    country: CountryCode;
    help?: string;
}) {
    const t = (es: string, pt: string, en: string) => regionalText(country, es, pt, en);
    const guides = [
        { key:"alquiler", question:t("¿Cómo alquilo un campo?","Como arrendo uma terra?","How do I rent farmland?"), answer:t("Elegí tu país y zona, seleccioná Campos y filtrá por Alquiler. Abrí una publicación y registrate o ingresá para consultar. Las condiciones se acuerdan directamente con quien publica.","Escolha o país e a região, selecione Terras e filtre por Arrendamento. Abra um anúncio e cadastre-se ou entre para consultar. As condições são combinadas diretamente com o anunciante.","Choose your country and area, select Farmland and filter by Lease. Open a listing and sign in or register to send an inquiry. Agree on terms directly with the advertiser.") },
        { key:"publicar", question:t("¿Cómo publico un campo o servicio?","Como anuncio uma terra ou serviço?","How do I list farmland or a service?"), answer:t("Elegí Publicar campo u Ofrecer servicios en esta página. Ingresá a tu cuenta, completá los datos y agregá fotos. Después podés gestionar la publicación desde Mi cuenta.","Escolha Anunciar terra ou Oferecer serviços nesta página. Entre na sua conta, preencha os dados e adicione fotos. Depois você pode gerenciar o anúncio em Minha conta.","Choose List farmland or Offer services on this page. Sign in, complete the details and add photos. Then manage your listing from My account.") },
    ];
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
      <details className="rural-home-faq" id="preguntas-frecuentes" open={guides.some(guide=>guide.key===help)}>
        <summary>{t("Preguntas frecuentes", "Perguntas frequentes", "Frequently asked questions")} <ChevronDown size={20} aria-hidden="true"/></summary>
        <div className="rural-home-faq-items">
          {guides.map(guide=><details key={guide.key} open={help===guide.key}><summary>{guide.question}<span aria-hidden="true">+</span></summary><p>{guide.answer}</p></details>)}
          {homeFAQContent(country).items.map((item) => (<details name="rural-home-question" key={item.question}>
              <summary>{item.question}<span aria-hidden="true">+</span></summary>
              <p>{item.answer}</p>
            </details>))}
        </div>
      </details>
    </section>);
}
