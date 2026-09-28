"use client";

import Link from "next/link";
import { useState } from "react";

const faqs = [
  [
    "¿Publicar tiene costo?",
    "Si sos Propietario de Tierras, tu primera publicación es gratis. Si después querés publicar más campos, podés elegir un paquete anual según la cantidad de publicaciones que necesites. El pago se realiza de forma segura con Mercado Pago.",
  ],
  [
    "¿Quién puede registrarse?",
    "Podés registrarte como Propietario de Tierras, Productor o Proveedor de Servicios Rurales. Los Propietarios publican sus campos; los Productores buscan tierras y oportunidades; y los Proveedores ofrecen servicios como siembra, cosecha, fletes, alambrados y otros trabajos rurales. Para Productores y Proveedores de Servicios, usar RentoCampo es 100% gratis de por vida.",
  ],
  [
    "¿RentoCampo interviene en el acuerdo?",
    "No. RentoCampo es el punto de encuentro entre Propietarios, Productores y Proveedores de Servicios Rurales. Te ayudamos a encontrar oportunidades y a iniciar el contacto, pero el precio, las condiciones de alquiler o del servicio y cualquier acuerdo se definen directamente entre los usuarios. RentoCampo no interviene en la negociación.",
  ],
  [
    "¿Cómo me contactan?",
    "Cuando alguien se interesa por un campo o por un servicio, puede enviar una consulta directamente desde la publicación. El mensaje llega a la sección Mensajes de RentoCampo para que puedan conversar de forma directa y continuar el contacto sin intermediarios.",
  ],
];

const planes = [
  {
    nombre: "Tierra Productiva",
    publicaciones: "Hasta 10 publicaciones",
    precio: "USD 100 / año",
  },
  {
    nombre: "Administrador de Tierras",
    publicaciones: "Hasta 20 publicaciones",
    precio: "USD 200 / año",
  },
  {
    nombre: "RentoCampo Portfolio",
    publicaciones: "Publicaciones ilimitadas",
    precio: "USD 399 / año",
  },
];

export default function LandingFAQ() {
  const [open, setOpen] = useState(0);

  return (
    <section className="rc-faq" id="preguntas">
      <div className="rc-shell rc-faq-grid">
        <div className="rc-faq-promise">
          <p className="rc-kicker">Preguntas frecuentes</p>
          <h2>
            <span>Productores y</span>
            <span>servicios rurales</span>
            <strong>100% gratis.</strong>
          </h2>
        </div>

        <div className="rc-faq-content">
          {faqs.map(([q, a], i) => (
            <div className="rc-question" key={q}>
              <button
                type="button"
                aria-expanded={open === i}
                onClick={() => setOpen(open === i ? -1 : i)}
              >
                <span>{q}</span>
                <span>{open === i ? "−" : "+"}</span>
              </button>

              {open === i && (
                <div className="rc-question-answer">
                  {i === 0 ? (
                    <p className="rc-faq-cost-copy">
                      <strong className="rc-faq-free">
                        La primer publicación para Propietarios de Tierras es GRATIS
                      </strong>
                      <span className="rc-faq-detail">{a}</span>
                      <span className="rc-faq-payment" aria-label="Pago disponible con Mercado Pago">
                        <img src="https://http2.mlstatic.com/frontend-assets/mp-web-navigation/ui-navigation/6.6.92/mercadopago/logo__large.png" alt="Mercado Pago" />
                      </span>
                    </p>
                  ) : (
                    <p>{a}</p>
                  )}

                  {i === 0 && (
                    <div className="rc-faq-plans" aria-label="Paquetes para publicar más campos">
                      {planes.map((plan) => (
                        <Link
                          className="rc-faq-plan"
                          key={plan.nombre}
                          href="/register?tipo=propietario"
                        >
                          <strong>{plan.nombre}</strong>
                          <span>{plan.publicaciones}</span>
                          <b>{plan.precio}</b>
                          <em>Crear cuenta →</em>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
