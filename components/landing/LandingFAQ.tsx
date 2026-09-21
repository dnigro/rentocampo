import Link from "next/link";
"use client";

import { useState } from "react";

const faqs = [
  [
    "¿Publicar tiene costo?",
    "La primera publicación es gratis. Si necesitás publicar más campos, podés elegir un plan según la cantidad de tierras que quieras gestionar.",
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
        <div>
          <p className="rc-kicker">Preguntas frecuentes</p>
          <h2>
            Todo claro.
            <br />
            Desde el inicio.
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
                  <p>{a}</p>

                  {i === 0 && (
                    <div className="rc-faq-plans" aria-label="Planes para publicar tierras">
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
