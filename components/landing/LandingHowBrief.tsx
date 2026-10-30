"use client";

import { useRegionalCountry } from "@/lib/i18n/useRegionalCountry";

const copy = {
  es: {
    eyebrow: "CÓMO FUNCIONA",
    title: "Del mapa al contacto directo.",
    description: "Buscá campos y servicios rurales en el mapa, o publicá lo que ofrecés. Registrate gratis y conversá por el chat con la otra persona para acordar directamente.",
    benefit: "GRATIS · SIN INTERMEDIARIOS · SIN COMISIONES",
  },
  pt: {
    eyebrow: "COMO FUNCIONA",
    title: "Do mapa ao contato direto.",
    description: "Encontre terras e serviços rurais no mapa ou anuncie o que você oferece. Cadastre-se gratuitamente e converse pelo chat para negociar diretamente com a outra pessoa.",
    benefit: "GRÁTIS · SEM INTERMEDIÁRIOS · SEM COMISSÕES",
  },
  en: {
    eyebrow: "HOW IT WORKS",
    title: "From the map to a direct connection.",
    description: "Explore farmland and rural services on the map, or list what you offer. Sign up for free and chat directly with other members to agree on the details.",
    benefit: "FREE · NO MIDDLEMEN · NO COMMISSIONS",
  },
};

export default function LandingHowBrief() {
  const country = useRegionalCountry();
  const content = country === "BR" ? copy.pt : country === "US" ? copy.en : copy.es;

  return (
    <section className="rc-how-brief" id="como-funciona" aria-labelledby="rc-how-brief-title">
      <div className="rc-shell rc-how-brief__layout">
        <div>
          <p className="rc-how-brief__eyebrow">{content.eyebrow}</p>
          <h2 className="rc-how-brief__title" id="rc-how-brief-title">{content.title}</h2>
        </div>
        <div className="rc-how-brief__copy">
          <p className="rc-how-brief__description">{content.description}</p>
          <p className="rc-how-brief__benefit">{content.benefit}</p>
        </div>
      </div>
    </section>
  );
}
