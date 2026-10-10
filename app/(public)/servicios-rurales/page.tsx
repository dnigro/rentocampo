import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { SERVICIOS_RURALES, SERVICIO_LABEL } from "@/data/servicios-rurales";
import type { ServicioRural } from "@/types";
import ListingHeader from "@/components/listings/ListingHeader";
import ServiciosFiltros from "@/components/servicios/ServiciosFiltros";
import "@/styles/explorador.css";
import "@/styles/servicios-rurales.css";

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

type SearchParams = {
  provincia?: string;
  servicio?: string;
};

type Prestador = {
  id: string;
  publicacion_id?: string;
  nombre: string;
  bio?: string | null;
  avatar_url?: string | null;
  service_photo_url?: string | null;
  servicios_rurales: ServicioRural[];
  zona_servicio?: string | null;
  provincia_servicio: string;
  localidad_servicio?: string | null;
  is_demo: boolean;
};

const pasos = [
  ["01", "Buscá por servicio", "Elegí la labor o especialidad que necesitás para tu campo."],
  ["02", "Encontrá prestadores", "Filtrá por provincia y revisá quién trabaja en tu zona."],
  ["03", "Contactá directamente", "Conversá por el chat de RentoCampo sin intermediarios."],
];

const preguntas = [
  {
    pregunta: "¿Buscar servicios rurales tiene costo?",
    respuesta:
      "No. Registrarte, buscar y contactar prestadores es gratis en esta etapa de RentoCampo.",
  },
  {
    pregunta: "¿Qué tipos de servicios puedo encontrar?",
    respuesta:
      "Podés buscar cosecha, siembra, pulverización, fertilización, maquinaria, transporte, riego, alambrados, veterinaria, agronomía y otras especialidades rurales.",
  },
  {
    pregunta: "¿Cómo publico los servicios que ofrezco?",
    respuesta:
      "Creá una cuenta como prestador, elegí tus servicios y definí la zona donde trabajás para aparecer en RentoCampo.",
  },
];

export default async function ServiciosRuralesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const provincia = params.provincia ?? "";
  const servicioValido = SERVICIOS_RURALES.some((item) => item.value === params.servicio)
    ? (params.servicio as ServicioRural)
    : "";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const ofrecerServiciosHref = user
    ? "/mis-servicios-rurales/nuevo"
    : "/register?tipo=prestador";

  let demosQuery = supabase
    .from("demo_servicios_rurales")
    .select(
      "id, nombre, bio, servicios_rurales, zona_servicio, provincia_servicio, localidad_servicio",
    )
    .eq("activo", true);

  if (provincia) {
    demosQuery = demosQuery.eq("provincia_servicio", provincia);
  }

  if (servicioValido) {
    demosQuery = demosQuery.contains("servicios_rurales", [servicioValido]);
  }

  const { data: demos } = await demosQuery.order("nombre", { ascending: true });

  const { data: publicaciones } = await supabase
    .from("servicios_publicaciones")
    .select("id, propietario_id, servicios_rurales, foto_url, provincia, localidad, zona, activo")
    .eq("activo", true);

  const ownerIds = [...new Set((publicaciones ?? []).map((p) => p.propietario_id))];
  const { data: owners } = ownerIds.length
    ? await supabase.from("profiles").select("id, nombre").in("id", ownerIds)
    : { data: [] as { id: string; nombre: string }[] };
  const ownerMap = new Map((owners ?? []).map((o) => [o.id, o.nombre]));

  const publicacionesPrestadores: Prestador[] = (publicaciones ?? [])
    .filter((p) => (!provincia || p.provincia === provincia) && (!servicioValido || (p.servicios_rurales ?? []).includes(servicioValido)))
    .map((p) => ({ id: p.propietario_id, publicacion_id: p.id, nombre: ownerMap.get(p.propietario_id) ?? "Prestador rural", service_photo_url: p.foto_url, servicios_rurales: p.servicios_rurales ?? [], zona_servicio: p.zona, provincia_servicio: p.provincia, localidad_servicio: p.localidad, is_demo: false }));

  const prestadores: Prestador[] = [
    ...publicacionesPrestadores,
    ...(demos ?? [])
      .filter((item) =>
        [
          "10000000-0000-4000-8000-000000000005",
          "10000000-0000-4000-8000-000000000010",
        ].includes(item.id),
      )
      .map((item) => ({
        ...item,
        avatar_url: null,
        service_photo_url: "/demo-servicio-veterinaria.jpg",
        is_demo: true,
      })),
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: "Servicios rurales en Argentina",
        description:
          "Contratistas y prestadores de servicios rurales por especialidad y zona.",
        url: `${SITE_URL}/servicios-rurales`,
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

  const mapParams = new URLSearchParams({ vista: "servicios" });
  if (provincia) mapParams.set("provincia", provincia);
  if (servicioValido) mapParams.set("servicio", servicioValido);

  return (
    <div className="servicios-seo-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <section className="explorador-layout" aria-labelledby="servicios-disponibles-titulo">
        <ListingHeader
          id="servicios-disponibles-titulo"
          title="Servicios disponibles"
          count={`${prestadores.length} prestador${prestadores.length !== 1 ? "es" : ""} encontrado${prestadores.length !== 1 ? "s" : ""}`}
          mapHref={`/campos/mapa?${mapParams.toString()}`}
        />

        <aside className="explorador-sidebar">
          <ServiciosFiltros
            provinciaInicial={provincia}
            servicioInicial={servicioValido}
          />
          <Link href={`/campos/mapa?${mapParams.toString()}`} className="listing-button rc-map-after-filters">Ver en mapa →</Link>
        </aside>

        <div className="explorador-main">
          {prestadores.length > 0 ? (
            <div className="servicios-prestadores-grid">
              {prestadores.map((prestador) => {
                const servicios = prestador.servicios_rurales ?? [];
                return (
                  <article className="prestador-card" data-demo={prestador.is_demo ? "true" : "false"} key={`${prestador.is_demo ? "demo" : "real"}-${prestador.id}`}>
                    {prestador.service_photo_url && (
                      <div className="prestador-card__image">
                        <Image
                          src={prestador.service_photo_url}
                          alt={`${prestador.nombre} · servicios rurales`}
                          width={900}
                          height={580}
                        />
                      </div>
                    )}

                    <div className="prestador-card__top">
                      <span className="prestador-card__badge">
                        {prestador.is_demo ? "DEMO" : "SERVICIO RURAL"}
                      </span>
                      <span className="prestador-card__provincia">
                        {prestador.provincia_servicio}
                      </span>
                    </div>

                    <h3>{prestador.nombre}</h3>
                    <p className="prestador-card__ubicacion">
                      📍 {[prestador.localidad_servicio, prestador.provincia_servicio]
                        .filter(Boolean)
                        .join(", ")}
                    </p>

                    <div className="prestador-card__tags">
                      {servicios.slice(0, 4).map((item) => (
                        <span key={item}>{SERVICIO_LABEL[item] ?? item}</span>
                      ))}
                      {servicios.length > 4 && <span>+{servicios.length - 4}</span>}
                    </div>

                    {prestador.zona_servicio && (
                      <p className="prestador-card__zona">
                        <strong>Zona:</strong> {prestador.zona_servicio}
                      </p>
                    )}

                    {prestador.bio && (
                      <p className="prestador-card__bio">{prestador.bio}</p>
                    )}

                    <div className="prestador-card__actions">
                      {!prestador.is_demo && user?.id === prestador.id ? (
                        <span className="prestador-card__own">
                          Este servicio es tuyo
                        </span>
                      ) : !user ? (
                        <Link href="/login?next=/servicios-rurales">
                          Ingresá para consultar →
                        </Link>
                      ) : prestador.is_demo ? (
                        <span className="prestador-card__own">
                          Servicio demo
                        </span>
                      ) : (
                        <Link href={prestador.publicacion_id ? `/servicios-rurales/${prestador.publicacion_id}` : `/servicios-rurales?prestador=${prestador.id}`}>
                          Ver ficha →
                        </Link>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="servicios-empty">
              <strong>No encontramos prestadores con estos filtros.</strong>
              <p>Probá otra provincia o rubro, o limpiá los filtros.</p>
              <Link href="/servicios-rurales">Ver todos los servicios →</Link>
            </div>
          )}
        </div>
      </section>

      <section className="servicios-section servicios-bordered" aria-labelledby="como-titulo">
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

      <section className="servicios-section servicios-bordered" aria-labelledby="faq-titulo">
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
          href={ofrecerServiciosHref}
          className="servicios-btn servicios-btn-yellow"
        >
          Crear perfil gratis →
        </Link>
      </section>
    </div>
  );
}
