import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import CamposListing, { type CamposSearchParams } from "@/components/campos/CamposListing";
import { APTITUD_SEO, PROVINCIAS_POR_SLUG, SITE_URL } from "@/lib/seo/campos";
import "@/styles/campos.css";
import "@/styles/explorador.css";

type Props = {
  params: Promise<{ segmentos?: string[] }>;
  searchParams: Promise<CamposSearchParams>;
};

const PROVINCIAS_DESTACADAS = [
  ["buenos-aires", "Buenos Aires"],
  ["cordoba", "Córdoba"],
  ["santa-fe", "Santa Fe"],
  ["entre-rios", "Entre Ríos"],
] as const;

function resolveCategoria(segmentos: string[] = []) {
  if (segmentos.length === 0) {
    return {
      filtros: {},
      titulo: "Alquiler de campos en Argentina",
      descripcion:
        "Encontrá campos en alquiler en Argentina, compará opciones agrícolas, ganaderas y mixtas y conectate directamente con propietarios.",
      canonical: "/alquiler-de-campos",
    };
  }

  if (segmentos.length !== 1) return null;
  const segmento = segmentos[0];
  const aptitud = APTITUD_SEO[segmento];
  if (aptitud) {
    return {
      filtros: { aptitud: aptitud.value },
      titulo: `${aptitud.label} en alquiler`,
      descripcion: `Explorá ${aptitud.label.toLowerCase()} disponibles en Argentina y conversá directamente con sus propietarios.`,
      canonical: `/alquiler-de-campos/${segmento}`,
    };
  }

  const provincia = PROVINCIAS_POR_SLUG[segmento];
  if (provincia) {
    return {
      filtros: { provincia },
      titulo: `Alquiler de campos en ${provincia}`,
      descripcion: `Explorá campos en alquiler en ${provincia}, filtrá por aptitud y conversá directamente con sus propietarios.`,
      canonical: `/alquiler-de-campos/${segmento}`,
    };
  }

  return null;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const [{ segmentos }, query] = await Promise.all([params, searchParams]);
  const categoria = resolveCategoria(segmentos);
  if (!categoria) return {};
  const tieneFiltrosAdicionales = Object.keys(query).some((key) => key !== "page");
  const admin = createAdminClient();
  let countQuery = admin
    .from("campos")
    .select("id", { count: "exact", head: true })
    .eq("status", "activo");
  if (categoria.filtros.provincia) {
    countQuery = countQuery.eq("provincia", categoria.filtros.provincia);
  }
  if (categoria.filtros.aptitud) {
    countQuery = countQuery.eq("aptitud", categoria.filtros.aptitud);
  }
  const { count } = await countQuery;

  return {
    title: `${categoria.titulo} | RentoCampo`,
    description: categoria.descripcion,
    keywords:
      categoria.canonical === "/alquiler-de-campos"
        ? "alquiler de campos, campos en alquiler, alquiler de campos en Argentina, alquiler de campo agrícola, alquiler de campo ganadero, arrendamiento rural"
        : undefined,
    alternates: { canonical: `${SITE_URL}${categoria.canonical}` },
    robots:
      tieneFiltrosAdicionales || count === 0
        ? { index: false, follow: true }
        : { index: true, follow: true },
    openGraph: {
      title: categoria.titulo,
      description: categoria.descripcion,
      url: `${SITE_URL}${categoria.canonical}`,
      type: "website",
      locale: "es_AR",
    },
  };
}

export default async function AlquilerDeCamposPage({ params, searchParams }: Props) {
  const [{ segmentos }, query] = await Promise.all([params, searchParams]);
  const categoria = resolveCategoria(segmentos);
  if (!categoria) notFound();

  const filtros = { ...query, ...categoria.filtros };
  const esLandingPrincipal = categoria.canonical === "/alquiler-de-campos";
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: categoria.titulo,
    description: categoria.descripcion,
    url: `${SITE_URL}${categoria.canonical}`,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Inicio", item: SITE_URL },
        {
          "@type": "ListItem",
          position: 2,
          name: "Alquiler de campos",
          item: `${SITE_URL}/alquiler-de-campos`,
        },
        ...(esLandingPrincipal
          ? []
          : [{
              "@type": "ListItem",
              position: 3,
              name: categoria.titulo,
              item: `${SITE_URL}${categoria.canonical}`,
            }]),
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd).replace(/</g, "\\u003c") }}
      />
      <CamposListing params={filtros} titulo={categoria.titulo} descripcion={categoria.descripcion} />

      {esLandingPrincipal && (
        <section className="alquiler-seo" aria-labelledby="alquiler-seo-title">
          <div className="alquiler-seo__inner">
            <p className="alquiler-seo__kicker">Alquiler de campos · Argentina</p>
            <h2 id="alquiler-seo-title">Encontrá el campo que necesitás para producir</h2>
            <p className="alquiler-seo__intro">
              RentoCampo reúne campos en alquiler y conecta de forma directa a productores
              con propietarios. Podés explorar oportunidades por ubicación y tipo de
              producción, revisar cada publicación y contactar sin intermediarios.
            </p>

            <div className="alquiler-seo__grid">
              <div>
                <h3>Alquiler de campos por provincia</h3>
                <div className="alquiler-seo__links">
                  {PROVINCIAS_DESTACADAS.map(([slug, nombre]) => (
                    <Link key={slug} href={`/alquiler-de-campos/${slug}`}>
                      Alquiler de campos en {nombre}
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <h3>Campos por tipo de producción</h3>
                <div className="alquiler-seo__links">
                  <Link href="/alquiler-de-campos/agricolas">Campos agrícolas en alquiler</Link>
                  <Link href="/alquiler-de-campos/ganaderos">Campos ganaderos en alquiler</Link>
                  <Link href="/alquiler-de-campos/mixtos">Campos mixtos en alquiler</Link>
                  <Link href="/alquiler-de-campos/forestales">Campos forestales en alquiler</Link>
                </div>
              </div>
            </div>

            <p className="alquiler-seo__closing">
              Si sos propietario, también podés publicar tu campo gratis para hacerlo visible
              frente a productores que buscan tierra en alquiler.
            </p>
          </div>
        </section>
      )}
    </>
  );
}
