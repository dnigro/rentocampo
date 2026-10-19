"use client";

import { useRef, useState } from "react";
import { useRegionalCountry } from "@/lib/i18n/useRegionalCountry";

const faqs = [
  { q: "¿Publicar tiene costo?", type: "cost" },
  { q: "¿Quién puede registrarse?", type: "users" },
  { q: "¿RentoCampo interviene en el acuerdo?", type: "agreement" },
  { q: "¿Cómo me contactan?", type: "contact" },
];


function FaqIcon({ children }: { children: string }) {
  return <span className="rc-faq-icon" aria-hidden="true">{children}</span>;
}

export default function LandingFAQ() {
  const country = useRegionalCountry();
  const [open, setOpen] = useState(-1);
  const faqRef = useRef<HTMLDivElement>(null);

  const toggleFaq = (index: number, button: HTMLButtonElement) => {
    const topBefore = button.getBoundingClientRect().top;
    setOpen(open === index ? -1 : index);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const topAfter = button.getBoundingClientRect().top;
        window.scrollBy({ top: topAfter - topBefore, behavior: "auto" });
      });
    });
  };

  if (country === "BR") {
    const items = [
      ["Anunciar tem custo?", "Nesta fase de expansão, anúncios de terras, serviços rurais, cadastro e contato são 100% gratuitos, sem limites comerciais de anúncios."],
      ["Quem pode se cadastrar?", "Proprietários de terras, produtores e prestadores de serviços rurais."],
      ["A RentoCampo participa da negociação?", "Não. Arrendamento, compra, venda e prestação de serviços são negociados diretamente entre os usuários."],
      ["Como entram em contato comigo?", "Interessados podem enviar mensagens pelo anúncio e você responde pela plataforma."],
    ];
    return <section className="rc-faq" id="preguntas"><div className="rc-shell rc-faq-grid">
      <div className="rc-faq-promise"><p className="rc-kicker">Perguntas frequentes</p>
        <h2><span>Anuncie, busque</span><span>e conecte-se</span><strong>100% grátis.</strong></h2></div>
      <div className="rc-faq-content" ref={faqRef}>
        {items.map(([question, answer], i) => <div className="rc-question" key={question}>
          <button type="button" aria-expanded={open === i} onClick={(event) => toggleFaq(i, event.currentTarget)}>
            <span>{question}</span><span>{open === i ? "−" : "+"}</span>
          </button>
          {open === i && <div className="rc-question-answer"><p>{answer}</p></div>}
        </div>)}
      </div></div></section>;
  }

  return (
    <section className="rc-faq" id="preguntas">
      <div className="rc-shell rc-faq-grid">
        <div className="rc-faq-promise">
          <p className="rc-kicker">Preguntas frecuentes</p>
          <h2><span>Publicá, buscá</span><span>y conectá</span><strong>100% gratis.</strong></h2>
        </div>

        <div className="rc-faq-content" ref={faqRef}>
          {faqs.map((faq, i) => (
            <div className="rc-question" key={faq.q}>
              <button type="button" aria-expanded={open === i} onClick={(event) => toggleFaq(i, event.currentTarget)}>
                <span>{faq.q}</span><span>{open === i ? "−" : "+"}</span>
              </button>

              {open === i && (
                <div className="rc-question-answer">
                  {faq.type === "cost" && (
                    <div className="rc-faq-cost-head">
                      <div>
                        <h3>PUBLICAR Y CONTACTAR ES <strong className="rc-faq-lifetime">100% GRATIS</strong></h3>
                        <p className="rc-faq-owner-free"><strong>PARA PROPIETARIOS, PRODUCTORES Y SERVICIOS RURALES</strong></p>
                        <p className="rc-faq-more-fields">
                          Durante esta etapa de crecimiento regional, publicar y contactar es gratis, sin límites comerciales de publicaciones.
                          Los acuerdos entre usuarios se realizan de forma directa.
                        </p>
                      </div>
                    </div>
                  )}


                  {faq.type === "users" && <div className="rc-faq-users">
                    <p className="rc-faq-intro">Pueden registrarse tres tipos de usuarios:</p>
                    <div className="rc-faq-user"><FaqIcon>🚜</FaqIcon><div><h3>Productores</h3><p>Buscan campos para alquilar o producir.</p><mark className="rc-free-tag">Gratis durante esta etapa</mark></div></div>
                    <div className="rc-faq-user"><FaqIcon>🌱</FaqIcon><div><h3>Propietarios de Tierras</h3><p>Publican sus campos principalmente para alquiler y, si lo necesitan, también para venta.</p><mark className="rc-owner-tag">Publicá tus campos gratis.</mark></div></div>
                    <div className="rc-faq-user"><FaqIcon>🔧</FaqIcon><div><h3>Proveedores de Servicios Rurales</h3><p>Publican sus servicios: siembra, cosecha, fletes, alambrados y otros trabajos rurales.</p><mark className="rc-free-tag">Gratis durante esta etapa</mark></div></div>
                  </div>}

                  {faq.type === "agreement" && <div className="rc-faq-info-row">
                    <FaqIcon>🤝</FaqIcon><div><p><strong>No.</strong> RentoCampo solo facilita el contacto directo entre Propietarios, Productores y Proveedores de Servicios Rurales.</p><p>Las condiciones de alquiler, compraventa, contratación de servicios y cualquier acuerdo comercial las definen directamente los usuarios.</p><p>RentoCampo brinda un espacio simple para encontrarse y conectarse.</p></div>
                  </div>}

                  {faq.type === "contact" && <div className="rc-faq-info-row">
                    <FaqIcon>💬</FaqIcon><div><p>Si alguien está interesado en un campo o en un servicio, puede enviarte una consulta directamente desde la publicación.</p><p>Los mensajes quedan disponibles en la sección <strong>Mensajes</strong> de RentoCampo para que puedas responder y continuar la conversación.</p><p>EL CONTACTO ES DIRECTO ENTRE USUARIOS, SIN INTERMEDIARIOS.</p></div>
                  </div>}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
