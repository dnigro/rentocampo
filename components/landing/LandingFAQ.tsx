"use client";

import Link from "next/link";
import { useState } from "react";

const faqs = [
  [
    "¿Publicar tiene costo?",
    "Para publicar más campos, elegí un paquete especial según la cantidad de publicaciones que necesitás.",
  ],
  [
    "¿Quién puede registrarse?",
    "Propietarios que publican campos y productores que buscan oportunidades. Un usuario puede tener ambos perfiles.",
  ],
  [
    "¿RentoCampo interviene en el acuerdo?",
    "Facilitamos el contacto directo; las condiciones las definen las partes.",
  ],
  [
    "¿Cómo me contactan?",
    "Los productores interesados pueden enviarte una consulta directa desde la publicación.",
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
