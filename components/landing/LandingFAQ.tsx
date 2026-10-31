"use client";

import { useRegionalCountry } from "@/lib/i18n/useRegionalCountry";

type FAQItem = { question: string; answer: string };
type FAQContent = { label: string; headline: string; emphasis: string; intro: string; items: FAQItem[] };

const localized: Record<"es" | "pt" | "en", FAQContent> = {
  es: {
    label: "PREGUNTAS FRECUENTES",
    headline: "TODO CLARO.",
    emphasis: "SIN VUELTAS.",
    intro: "Las respuestas que necesitás para empezar.",
    items: [
      {
        question: "¿Cómo funciona RentoCampo?",
        answer: "Explorá campos y servicios en el mapa o publicá lo que ofrecés. Registrate gratis y conversá por el chat con la otra persona para acordar directamente.",
      },
      {
        question: "¿Publicar tiene costo?",
        answer: "Durante esta etapa de crecimiento regional, registrarte, publicar campos o servicios rurales y contactar a otros usuarios es gratis. RentoCampo no cobra comisiones por los acuerdos.",
      },
      {
        question: "¿Quién puede registrarse?",
        answer: "Propietarios de tierras, productores agropecuarios y prestadores de servicios rurales. Cada uno puede buscar oportunidades, publicar o contactar según lo que necesite.",
      },
      {
        question: "¿RentoCampo interviene en los acuerdos?",
        answer: "No. Las condiciones de alquiler, venta o contratación de servicios las acuerdan directamente las personas involucradas. RentoCampo facilita el encuentro y el contacto.",
      },
      {
        question: "¿Cómo me contactan?",
        answer: "Quienes se interesen por tu publicación pueden enviarte una consulta desde la plataforma. Podés responder y continuar la conversación en la sección Mensajes.",
      },
    ],
  },
  pt: {
    label: "PERGUNTAS FREQUENTES",
    headline: "TUDO CLARO.",
    emphasis: "SEM COMPLICAÇÕES.",
    intro: "As respostas que você precisa para começar.",
    items: [
      {
        question: "Como funciona a RentoCampo?",
        answer: "Explore terras e serviços no mapa ou anuncie o que você oferece. Cadastre-se gratuitamente e converse pelo chat para negociar diretamente com a outra pessoa.",
      },
      {
        question: "Anunciar tem custo?",
        answer: "Nesta fase de crescimento regional, o cadastro, os anúncios de terras ou serviços e o contato com outros usuários são gratuitos. A RentoCampo não cobra comissão pelos acordos.",
      },
      {
        question: "Quem pode se cadastrar?",
        answer: "Proprietários de terras, produtores rurais e prestadores de serviços. Cada participante pode buscar, anunciar ou entrar em contato conforme suas necessidades.",
      },
      {
        question: "A RentoCampo participa dos acordos?",
        answer: "Não. As condições de arrendamento, compra, venda ou contratação de serviços são definidas diretamente pelos participantes. A RentoCampo facilita o contato.",
      },
      {
        question: "Como entram em contato comigo?",
        answer: "Pessoas interessadas podem enviar uma consulta pelo seu anúncio. Você pode responder e continuar a conversa na seção Mensagens.",
      },
    ],
  },
  en: {
    label: "FREQUENTLY ASKED QUESTIONS",
    headline: "STRAIGHT ANSWERS.",
    emphasis: "NO DETOURS.",
    intro: "Everything you need to get started.",
    items: [
      {
        question: "How does RentoCampo work?",
        answer: "Explore farmland and rural services on the map or list what you offer. Register for free, then use the chat to agree on terms directly with other members.",
      },
      {
        question: "Does listing cost anything?",
        answer: "During this regional growth stage, registration, farmland and service listings, and direct contact are free. RentoCampo does not charge commissions on agreements.",
      },
      {
        question: "Who can join?",
        answer: "Landowners, farmers and rural service providers. Each member can explore opportunities, create listings or contact others.",
      },
      {
        question: "Does RentoCampo negotiate for members?",
        answer: "No. Rental, sales and service terms are agreed directly between the people involved. RentoCampo only facilitates discovery and contact.",
      },
      {
        question: "How can people contact me?",
        answer: "Interested members can send an inquiry through your listing. You can reply and continue the conversation in Messages.",
      },
    ],
  },
};

export default function LandingFAQ() {
  const country = useRegionalCountry();
  const copy = localized[country === "BR" ? "pt" : country === "US" ? "en" : "es"];

  return (
    <section className="rcf-faq" id="como-funciona" aria-labelledby="rcf-faq-title">
      {/* Conserva los enlaces existentes a /#preguntas y /#como-funciona. */}
      <span id="preguntas" className="rcf-faq__anchor" aria-hidden="true" />
      <div className="rcf-faq__container">
        <div className="rcf-faq__intro">
          <p className="rcf-faq__eyebrow">{copy.label}</p>
          <h2 id="rcf-faq-title" className="rcf-faq__title">
            <span>{copy.headline}</span>
            <span>{copy.emphasis}</span>
          </h2>
          <span className="rcf-faq__rule" aria-hidden="true" />
          <p className="rcf-faq__subtitle">{copy.intro}</p>
        </div>
        <div className="rcf-faq__list">
          {copy.items.map((item) => (
            <details key={item.question} className="rcf-faq__item" name="rentocampo-faq">
              <summary className="rcf-faq__question">
                <span>{item.question}</span>
                <span className="rcf-faq__symbol" aria-hidden="true" />
              </summary>
              <div className="rcf-faq__answer">
                <p>{item.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
