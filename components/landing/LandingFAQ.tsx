"use client";

import Link from "next/link";
import { useState } from "react";

const faqs = [
  [
    "¿Publicar tiene costo?",
    "Para publicar más campos, elegí un paquete especial según la cantidad de publicaciones que necesitás. El pago se realiza de forma segura con Mercado Pago.",
  ],
  [
    "¿Quién puede registrarse?",
    "RentoCampo conecta a los tres actores de la red rural: Propietarios de Tierras que publican campos, Productores que buscan oportunidades y Proveedores de Servicios Rurales que ofrecen su trabajo. Un mismo usuario puede participar con más de un perfil. Para Productores y Proveedores de Servicios, registrarse, buscar, contactar y publicar servicios es 100% GRATIS, de por vida.",
  ],
  [
    "¿RentoCampo interviene en el acuerdo?",
    "RentoCampo facilita el encuentro y el contacto directo entre Propietarios, Productores y Proveedores de Servicios Rurales. Las condiciones comerciales, técnicas y contractuales se acuerdan directamente entre las partes; RentoCampo no interviene en la negociación ni cobra comisión por esos acuerdos.",
  ],
  [
    "¿Cómo me contactan?",
    "Propietarios, Productores y Proveedores de Servicios Rurales pueden contactarse directamente desde cada publicación mediante el sistema de mensajes de RentoCampo. Así, una consulta por un campo o por un servicio llega al usuario que publicó, sin intermediarios.",
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
                      <strong className="rc-faq-detail">{a}</strong>
                      <span className="rc-faq-payment" aria-label="Pago disponible con Mercado Pago">
                        <span className="rc-mp-mark" aria-hidden="true">MP</span>
                        <strong>Pagá con Mercado Pago</strong>
                      </span>
                    </p>
                  ) : (
                    <p><strong>{a}</strong></p>
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
