import { demoServiceRegisterHref, esServicioDemoVisible } from "@/data/visible-demo-services";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { COUNTRIES, resolveCountry } from "@/data/countries";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { SERVICIOS_RURALES, servicioLabel } from "@/data/servicios-rurales";
import { regionalText } from "@/lib/i18n/regional";
import type { ServicioRural } from "@/types";
import ListingHeader from "@/components/listings/ListingHeader";
import ListingExplorerToolbar from "@/components/listings/ListingExplorerToolbar";
import ServiciosFiltros from "@/components/servicios/ServiciosFiltros";
import ListingFiltersPanel from "@/components/listings/ListingFiltersPanel";
import DemandaZonasPanel from "@/components/campos/DemandaZonasPanel";
import { regionalPublicationHref, regionalPublicationLabel } from "@/lib/publicacion-regional";
import "@/styles/explorador.css";
import "@/styles/servicios-rurales.css";

const SITE_URL = "https://rentocampo.com";

const baseMetadata: Metadata = {
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
  pais?: string;
  provincia?: string;
  servicio?: string;
};

export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParams> }): Promise<Metadata> {
  const params = await searchParams;
  const pais = resolveCountry(params.pais, (await cookies()).get("rentocampo_country")?.value);
  const title = `${pais === "BR" ? "Serviços rurais" : "Servicios rurales"} en ${COUNTRIES[pais].name} | RentoCampo`.replace("Serviços rurais en", "Serviços rurais no");
  // A single canonical for Argentina; other countries have explicit, stable URLs.
  // Faceted searches must not compete with the main landing in Google.
  const url = pais === "AR" ? `${SITE_URL}/servicios-rurales` : `${SITE_URL}/servicios-rurales?pais=${pais}`;
  const hasFilters = Boolean(params.provincia || params.servicio);
  const hasExplicitCountry = Boolean(params.pais);
  return {
    ...baseMetadata,
    title,
    description: pais==="BR"?`Encontre serviços rurais no Brasil por categoria e região.`:`Encontrá servicios rurales en ${COUNTRIES[pais].name} por especialidad y zona.`,
    alternates: { canonical: url },
    robots: { index: !hasFilters && (pais === "AR" || hasExplicitCountry), follow: true },
    openGraph: { ...baseMetadata.openGraph, title, url, locale: COUNTRIES[pais].locale.replace("-", "_") },
  };
}

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
  const saved = (await cookies()).get("rentocampo_country")?.value;
  const pais = resolveCountry(params.pais, saved);
  const tt=(es:string,pt:string)=>regionalText(pais,es,pt);
  const provincia = params.provincia ?? "";
  const servicioValido = SERVICIOS_RURALES.some((item) => item.value === params.servicio)
    ? (params.servicio as ServicioRural)
    : "";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const ofrecerServiciosHref = regionalPublicationHref({ country: pais, kind: "servicio", authenticated: Boolean(user) });

  let demosQuery = supabase
    .from("demo_servicios_rurales")
    .select(
      "id, nombre, bio, servicios_rurales, zona_servicio, provincia_servicio, localidad_servicio, country_code, imagen_url",
    )
    .eq("activo", true)
    .eq("country_code", pais);

  if (provincia) {
    demosQuery = demosQuery.eq("provincia_servicio", provincia);
  }

  if (servicioValido) {
    demosQuery = demosQuery.contains("servicios_rurales", [servicioValido]);
  }

  const { data: demos } = await demosQuery.order("nombre", { ascending: true });

  const { data: publicaciones } = await supabase
    .from("servicios_publicaciones")
    .select("id, propietario_id, servicios_rurales, foto_url, provincia, localidad, zona, activo, country_code")
    .eq("activo", true)
    .eq("country_code", pais);

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
      .filter((item) => esServicioDemoVisible(item.id))
      .map((item) => ({
        ...item,
        avatar_url: null,
        service_photo_url: item.imagen_url || "/demo-servicio-veterinaria.jpg",
        is_demo: true,
      })),
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: `${pais==="BR"?"Serviços rurais no":"Servicios rurales en"} ${COUNTRIES[pais].name}`,
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
  mapParams.set("pais", pais);
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

      <section className="explorador-layout explorador-layout-results-first" aria-labelledby="servicios-disponibles-titulo">
        <ListingHeader
          id="servicios-disponibles-titulo"
          title={`${tt("Servicios rurales en", "Serviços rurais no")} ${COUNTRIES[pais].name}`}
          description={tt(`Encontrá profesionales y servicios rurales en ${COUNTRIES[pais].name}. Contactalos directamente.`, `Encontre profissionais e serviços rurais no ${COUNTRIES[pais].name}. Entre em contato diretamente.`)}
          eyebrow={tt("SERVICIOS PARA PRODUCIR", "SERVIÇOS PARA PRODUZIR")}
          count={pais==="BR"?`${prestadores.length} prestador${prestadores.length !== 1?"es":""} encontrado${prestadores.length!==1?"s":""}`:`${prestadores.length} prestador${prestadores.length !== 1 ? "es" : ""} encontrado${prestadores.length !== 1 ? "s" : ""}`}
        />

        <ListingExplorerToolbar
          country={pais}
          mapHref={`/campos/mapa?${mapParams.toString()}`}
          mapLabel={tt("Ver en mapa", "Ver no mapa")}
          relatedHref={`/campos?pais=${pais}`}
          relatedLabel={tt("Explorar campos", "Explorar terras")}
          ariaLabel={tt("Explorar servicios por país", "Explorar serviços por país")}
        />

        <div className="explorador-main">
          <div className="rc-explorer-grid">
            <ListingFiltersPanel
              title={tt("Filtrar servicios", "Filtrar serviços")}
              activeCount={[provincia, servicioValido].filter(Boolean).length}
            >
              <ServiciosFiltros
                key={pais}
                paisInicial={pais}
                provinciaInicial={provincia}
                servicioInicial={servicioValido}
              />
            </ListingFiltersPanel>
            <div className="rc-explorer-grid__results">
          {prestadores.length > 0 ? (
            <div className="servicios-prestadores-grid">
              {prestadores.map((prestador) => {
                const servicios = prestador.servicios_rurales ?? [];
                return (
                  <article className="prestador-card" data-demo={prestador.is_demo ? "true" : "false"} key={`${prestador.is_demo ? "demo" : "real"}-${prestador.publicacion_id ?? prestador.id}`}>
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
                        {prestador.is_demo ? "DEMO" : tt("SERVICIO RURAL","SERVIÇO RURAL")}
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
                        <span key={item}>{servicioLabel(item,pais)}</span>
                      ))}
                      {servicios.length > 4 && <span>+{servicios.length - 4}</span>}
                    </div>

                    {prestador.zona_servicio && (
                      <p className="prestador-card__zona">
                        <strong>{tt("Zona:", "Região:")}</strong> {prestador.zona_servicio}
                      </p>
                    )}

                    {prestador.bio && (
                      <p className="prestador-card__bio">{prestador.bio}</p>
                    )}

                    <div className="prestador-card__actions">
                      {prestador.is_demo ? (
                        <Link href={demoServiceRegisterHref(pais, Boolean(user))}>
                          {regionalPublicationLabel({ country: pais, kind: "servicio", authenticated: Boolean(user) })} →
                        </Link>
                      ) : user?.id === prestador.id ? (
                        <span className="prestador-card__own">
                          {tt("Este servicio es tuyo", "Este serviço é seu")}
                        </span>
                      ) : !user ? (
                        <Link href="/login?next=/servicios-rurales">
                          {tt("Ingresá para consultar →", "Entre para consultar →")}
                        </Link>
                      ) : (
                        <Link href={prestador.publicacion_id ? `/servicios-rurales/${prestador.publicacion_id}` : `/servicios-rurales?prestador=${prestador.id}`}>
                          {tt("Ver ficha →", "Ver anúncio →")}
                        </Link>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="servicios-empty">
              <strong>{tt("No encontramos prestadores con estos filtros.", "Não encontramos prestadores com esses filtros.")}</strong>
              <p>{tt("Probá otra provincia o rubro, o limpiá los filtros.", "Tente outro estado ou categoria, ou limpe os filtros.")}</p>
              <Link href={`/servicios-rurales?pais=${pais}`}>{tt("Ver todos los servicios →", "Ver todos os serviços →")}</Link>
            </div>
          )}

            </div>
          </div>
        </div>
      </section>

      <section className="servicios-section servicios-bordered" aria-labelledby="como-titulo">
        <div className="servicios-heading">
          <span>{tt("Simple y directo", "Simples e direto")}</span>
          <h2 id="como-titulo">{tt("Conectate en tres pasos.", "Conecte-se em três passos.")}</h2>
        </div>
        <div className="servicios-pasos">
          {pasos.map(([numero, titulo, texto],index) => (
            <article key={numero}>
              <span>{numero}</span>
              <h3>{pais==="BR"?["Busque por serviço","Encontre prestadores","Entre em contato"][index]:titulo}</h3>
              <p>{pais==="BR"?["Escolha o serviço de que sua terra precisa.","Filtre por estado e encontre profissionais em sua região.","Converse diretamente pela RentoCampo, sem intermediários."][index]:texto}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="servicios-section servicios-bordered" aria-labelledby="faq-titulo">
        <div className="servicios-heading">
          <span>{tt("Preguntas frecuentes", "Perguntas frequentes")}</span>
          <h2 id="faq-titulo">{tt("Todo claro desde el inicio.", "Tudo claro desde o início.")}</h2>
        </div>
        <div className="servicios-faq-list">
          {preguntas.map((item,index) => (
            <details key={item.pregunta}>
              <summary>{pais==="BR"?["Buscar serviços rurais tem custo?","Que tipos de serviços posso encontrar?","Como anuncio os serviços que ofereço?"][index]:item.pregunta}</summary>
              <p>{pais==="BR"?["Não. Cadastro, busca e contato com prestadores são gratuitos nesta etapa.","Encontre plantio, colheita, máquinas, transporte, cercas, veterinária, agronomia e outros serviços rurais.","Crie sua conta como prestador, escolha seus serviços e informe onde atende."][index]:item.respuesta}</p>
            </details>
          ))}
        </div>
      </section>

      <DemandaZonasPanel country={pais} provincia={provincia} authenticated={Boolean(user)} kind="servicio" />

      <section className="servicios-cta">
        <div>
          <span>{tt("¿Trabajás para el campo?", "Você trabalha para o campo?")}</span>
          <h2>{tt("Mostrá tus servicios en todo el país.", "Anuncie seus serviços em todo o Brasil.")}</h2>
        </div>
        <Link
          href={ofrecerServiciosHref}
          className="servicios-btn servicios-btn-yellow"
        >
          {regionalPublicationLabel({ country: pais, kind: "servicio", authenticated: Boolean(user) })} →
        </Link>
      </section>
    </div>
  );
}
