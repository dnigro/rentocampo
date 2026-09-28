"use client";

import Link from "next/link";
import { useState } from "react";

const faqs = [
  { q: "¿Publicar tiene costo?", type: "cost" },
  { q: "¿Quién puede registrarse?", type: "users" },
  { q: "¿RentoCampo interviene en el acuerdo?", type: "agreement" },
  { q: "¿Cómo me contactan?", type: "contact" },
];

const planes = [
  { nombre: "Tierra Productiva", publicaciones: "Hasta 10 publicaciones", precio: "USD 100 / año" },
  { nombre: "Administrador de Tierras", publicaciones: "Hasta 20 publicaciones", precio: "USD 200 / año" },
  { nombre: "RentoCampo Portfolio", publicaciones: "Publicaciones ilimitadas", precio: "USD 399 / año" },
];

function FaqIcon({ children }: { children: string }) {
  return <span className="rc-faq-icon" aria-hidden="true">{children}</span>;
}

export default function LandingFAQ() {
  const [open, setOpen] = useState(0);

  return (
    <section className="rc-faq" id="preguntas">
      <div className="rc-shell rc-faq-grid">
        <div className="rc-faq-promise">
          <p className="rc-kicker">Preguntas frecuentes</p>
          <h2><span>Productores y</span><span>servicios rurales</span><strong>100% gratis.</strong></h2>
        </div>

        <div className="rc-faq-content">
          {faqs.map((faq, i) => (
            <div className="rc-question" key={faq.q}>
              <button type="button" aria-expanded={open === i} onClick={() => setOpen(open === i ? -1 : i)}>
                <span>{faq.q}</span><span>{open === i ? "−" : "+"}</span>
              </button>

              {open === i && (
                <div className="rc-question-answer">
                  {faq.type === "cost" && <>
                    <div className="rc-faq-cost-head">
                      <div>
                        <h3>La primera publicación para Propietarios de Tierras es GRATIS</h3>
                        <p>Para publicar más campos, elegí un paquete anual según la cantidad de publicaciones que necesitás. El pago se realiza de forma segura con Mercado Pago.</p>
                      </div>
                      <div className="rc-mp-brand" aria-label="Mercado Pago">
                        <span className="rc-mp-handshake">🤝</span>
                        <span>mercado<br/>pago</span>
                      </div>
                    </div>
                    <div className="rc-faq-plans" aria-label="Paquetes para publicar más campos">
                      {planes.map((plan) => <Link className="rc-faq-plan" key={plan.nombre} href="/register?tipo=propietario">
                        <strong>{plan.nombre}</strong><span>{plan.publicaciones}</span><b>{plan.precio}</b><em>Crear cuenta →</em>
                      </Link>)}
                    </div>
                  </>}

                  {faq.type === "users" && <div className="rc-faq-users">
                    <p className="rc-faq-intro">Pueden registrarse tres tipos de usuarios:</p>
                    <div className="rc-faq-user"><FaqIcon>🚜</FaqIcon><div><h3>Productores</h3><p>Buscan campos para alquilar o producir.</p><mark className="rc-free-tag">100% gratis de por vida</mark></div></div>
                    <div className="rc-faq-user"><FaqIcon>🌱</FaqIcon><div><h3>Propietarios de Tierras</h3><p>Publican sus campos para que productores los contacten.</p><mark className="rc-owner-tag">Primera publicación gratis, luego paquetes según tus necesidades.</mark></div></div>
                    <div className="rc-faq-user"><FaqIcon>🔧</FaqIcon><div><h3>Proveedores de Servicios Rurales</h3><p>Publican sus servicios: siembra, cosecha, fletes, alambrados y otros trabajos rurales.</p><mark className="rc-free-tag">100% gratis de por vida</mark></div></div>
                  </div>}

                  {faq.type === "agreement" && <div className="rc-faq-info-row">
                    <FaqIcon>🤝</FaqIcon><div><p><strong>No.</strong> RentoCampo solo facilita el contacto directo entre Propietarios, Productores y Proveedores de Servicios Rurales.</p><p>Las condiciones de alquiler, contratación de servicios y cualquier acuerdo comercial las definen directamente los usuarios.</p><p>RentoCampo brinda un espacio simple para encontrarse y conectarse.</p></div>
                  </div>}

                  {faq.type === "contact" && <div className="rc-faq-info-row">
                    <FaqIcon>💬</FaqIcon><div><p>Si alguien está interesado en un campo o en un servicio, puede enviarte una consulta directamente desde la publicación.</p><p>Los mensajes quedan disponibles en la sección <strong>Mensajes</strong> de RentoCampo para que puedas responder y continuar la conversación.</p><p>El contacto es directo entre usuarios, sin intermediarios.</p></div>
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
