import type { Metadata } from "next";
import Link from "next/link";
import { SERVICIOS_RURALES } from "@/data/servicios-rurales";
import "@/styles/servicios-rurales.css";

// Fuerza un nuevo Preview de Vercel; no modifica producción.

const SITE_URL = "https://rentocampo.com";

export const metadata: Metadata = {
  title: "Servicios rurales en Argentina | RentoCampo",
  description:
    "Encontrá contratistas y prestadores de cosecha, siembra, pulverización, maquinaria, transporte y otros servicios rurales en Argentina.",
  alternates: { canonical: `${SITE_URL}/servicios-rurales` },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Servicios rurales en Argentina | RentoCampo",
    description:
      "Conectá con contratistas y prestadores rurales por servicio y zona, de forma directa y gratuita.",
    url: `${SITE_URL}/servicios-rurales`,
    type: "website",
    locale: "es_AR",
  },
};

const pasos = [
  [
    "01",
    "Buscá por servicio",
    "Elegí la labor o especialidad que necesitás para tu campo.",
  ],
  [
    "02",
    "Ubicá prestadores",
    "Explorá el mapa y encontrá opciones que trabajen en tu zona.",
  ],
  [
    "03",
    "Contactá directamente",
    "Conversá por el chat de RentoCampo sin intermediarios.",
  ],
];

const preguntas = [
  {
    pregunta: "¿Buscar servicios rurales tiene costo?",
    respuesta:
      "No. Registrarte, explorar el mapa y contactar prestadores es gratis en esta etapa de RentoCampo.",
  },
  {
    pregunta: "¿Qué tipos de servicios puedo encontrar?",
    respuesta:
      "Podés buscar cosecha, siembra, pulverización, fertilización, maquinaria, transporte, riego, alambrados, veterinaria, agronomía y otras especialidades rurales.",
  },
  {
    pregunta: "¿Cómo publico los servicios que ofrezco?",
    respuesta:
      "Creá una cuenta como prestador, elegí tus servicios y definí la zona donde trabajás para aparecer en el mapa.",
  },
];

export default function ServiciosRuralesPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: "Servicios rurales en Argentina",
        description:
          "Contratistas y prestadores de servicios rurales por especialidad y zona.",
        url: `${SITE_URL}/servicios-rurales`,
        mainEntity: {
          "@type": "ItemList",
          itemListElement: SERVICIOS_RURALES.map((servicio, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: servicio.label,
          })),
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: preguntas.map((item) => ({
          "@type": "Question",
          name: item.pregunta,
          acceptedAnswer: { "@type": "Answer", text: item.respuesta },
        })),
      },
    ],
  };

  return (
    <div className="servicios-seo-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <section className="servicios-hero">
        <span className="servicios-kicker">Servicios rurales · Argentina</span>
        <h1>El trabajo que el campo necesita, más cerca.</h1>
        <p>
          Encontrá contratistas y prestadores por especialidad y zona. Revisá
          sus servicios y conversá directamente desde RentoCampo.
        </p>
        <div className="servicios-actions">
          <Link
            href="/campos/mapa?vista=servicios"
            className="servicios-btn servicios-btn-primary"
          >
            Ver mapa de servicios →
          </Link>
          <Link
            href="/register?tipo=prestador"
            className="servicios-btn servicios-btn-secondary"
          >
            Ofrecer mis servicios
          </Link>
        </div>
      </section>

      <section className="servicios-section" aria-labelledby="catalogo-titulo">
        <div className="servicios-heading">
          <span>Todo el ecosistema rural</span>
          <h2 id="catalogo-titulo">¿Qué servicio estás buscando?</h2>
          <p>
            Desde las labores de campaña hasta la logística, la infraestructura
            y el asesoramiento técnico.
          </p>
        </div>
        <div className="servicios-grid">
          {SERVICIOS_RURALES.filter(
            (servicio) => servicio.value !== "otro",
          ).map((servicio, index) => (
            <Link
              key={servicio.value}
              href={`/campos/mapa?vista=servicios&servicio=${servicio.value}`}
              className="servicio-card"
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{servicio.label}</strong>
              <span aria-hidden="true">→</span>
            </Link>
          ))}
        </div>
      </section>

      <section
        className="servicios-section servicios-bordered"
        aria-labelledby="como-titulo"
      >
        <div className="servicios-heading">
          <span>Simple y directo</span>
          <h2 id="como-titulo">Conectate en tres pasos.</h2>
        </div>
        <div className="servicios-pasos">
          {pasos.map(([numero, titulo, texto]) => (
            <article key={numero}>
              <span>{numero}</span>
              <h3>{titulo}</h3>
              <p>{texto}</p>
            </article>
          ))}
        </div>
      </section>

      <section
        className="servicios-section servicios-bordered"
        aria-labelledby="faq-titulo"
      >
        <div className="servicios-heading">
          <span>Preguntas frecuentes</span>
          <h2 id="faq-titulo">Todo claro desde el inicio.</h2>
        </div>
        <div className="servicios-faq-list">
          {preguntas.map((item) => (
            <details key={item.pregunta}>
              <summary>{item.pregunta}</summary>
              <p>{item.respuesta}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="servicios-cta">
        <div>
          <span>¿Trabajás para el campo?</span>
          <h2>Mostrá tus servicios en todo el país.</h2>
        </div>
        <Link
          href="/register?tipo=prestador"
          className="servicios-btn servicios-btn-yellow"
        >
          Crear perfil gratis →
        </Link>
      </section>
    </div>
  );
}
