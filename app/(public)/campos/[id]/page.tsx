import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import ConsultaButton from "@/components/campos/ConsultaButton";
import GaleriaCarrusel from "@/components/campos/GaleriaCarrusel";
import "@/styles/carrusel.css";
import "@/styles/campos.css";
import "@/styles/ficha.css";
import "@/styles/favoritos.css";
import VolverButton from "@/components/campos/VolverButton";
import "@/styles/favoritos.css";
import FavoritoBtn from "@/components/campos/FavoritoBtn";
import { campoDescription, campoSeoTitle, SITE_URL } from "@/lib/seo/campos";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const admin = createAdminClient();
  const { data: campo } = await admin
    .from("campos")
    .select("titulo, hectareas, aptitud, localidad, provincia, status")
    .eq("id", id)
    .eq("status", "activo")
    .maybeSingle();

  if (!campo)
    return {
      title: "Campo no disponible | RentoCampo",
      robots: { index: false },
    };
  const description = campoDescription(campo);
  const title = campoSeoTitle(campo);

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/campos/${id}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/campos/${id}`,
      type: "website",
      locale: "es_AR",
    },
  };
}

export default async function CampoFichaPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const admin = createAdminClient();

  // La ficha es pública, pero solo expone campos publicados.
  // La lectura administrativa evita que las políticas RLS privadas conviertan
  // un campo activo en un 404 para visitantes no propietarios.
  const { data: campo, error: campoError } = await admin
    .from("campos")
    .select("*")
    .eq("id", id)
    .eq("status", "activo")
    .maybeSingle();

  if (campoError || !campo) notFound();

  const [{ data: fotos }, { data: propietario }] = await Promise.all([
    admin
      .from("campos_fotos")
      .select("url, orden")
      .eq("campo_id", id)
      .order("orden"),
    admin
      .from("profiles")
      .select("id, nombre, apellido, avatar_url")
      .eq("id", campo.propietario_id)
      .maybeSingle(),
  ]);

  const campoConPropietario = { ...campo, propietario };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const fotosOrdenadas = fotos?.sort((a, b) => a.orden - b.orden) ?? [];

  const APTITUD_LABEL: Record<string, string> = {
    agricola: "Agrícola",
    ganadera: "Ganadera",
    mixta: "Mixta",
    forestal: "Forestal",
    otro: "Otro",
  };

  const disponibilidad = campoConPropietario.disponibilidad_desde
    ? new Date(campoConPropietario.disponibilidad_desde) <= new Date()
      ? "Disponible ahora"
      : "Campaña próxima"
    : "A convenir";

  const placeJsonLd = {
    "@context": "https://schema.org",
    "@type": "Place",
    name: campoConPropietario.titulo,
    description: campoDescription(campoConPropietario),
    url: `${SITE_URL}/campos/${id}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: campoConPropietario.localidad || undefined,
      addressRegion: campoConPropietario.provincia || undefined,
      addressCountry: "AR",
    },
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "Superficie",
        value: `${campoConPropietario.hectareas} hectáreas`,
      },
      {
        "@type": "PropertyValue",
        name: "Aptitud",
        value:
          APTITUD_LABEL[campoConPropietario.aptitud] ??
          campoConPropietario.aptitud,
      },
    ],
  };

  return (
    <div className="ficha-container">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(placeJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <VolverButton />
      {/* Galería de fotos */}
      <GaleriaCarrusel
        fotos={fotosOrdenadas}
        titulo={campoConPropietario.titulo}
      />

      <div className="ficha-body">
        {/* Columna principal */}
        <div className="ficha-main">
          <div className="ficha-tags">
            <span className="aptitud-tag">
              {APTITUD_LABEL[campoConPropietario.aptitud] ??
                campoConPropietario.aptitud}
            </span>
            {campoConPropietario.mejoras === "Sí" && (
              <span className="mejoras-tag">Con mejoras</span>
            )}
            <span className="disp-badge disp-a-convenir">{disponibilidad}</span>
          </div>

          <h1 className="ficha-titulo">{campoConPropietario.titulo}</h1>

          <p className="ficha-ubicacion">
            📍{" "}
            {[
              campoConPropietario.localidad,
              campoConPropietario.departamento,
              campoConPropietario.provincia,
            ]
              .filter(Boolean)
              .join(", ")}
          </p>

          {/* Datos clave */}
          <div className="ficha-datos">
            <div className="dato-item">
              <span className="dato-valor">
                {campoConPropietario.hectareas.toLocaleString("es-AR")}
              </span>
              <span className="dato-label">Hectáreas</span>
            </div>
            <div className="dato-sep" />
            <div className="dato-item">
              <span className="dato-valor">
                {APTITUD_LABEL[campoConPropietario.aptitud]}
              </span>
              <span className="dato-label">Aptitud</span>
            </div>
            {campoConPropietario.rendimiento_estimado && (
              <>
                <div className="dato-sep" />
                <div className="dato-item">
                  <span className="dato-valor">
                    {campoConPropietario.rendimiento_estimado} qq/ha
                  </span>
                  <span className="dato-label">Rend. estimado</span>
                </div>
              </>
            )}
            <div className="dato-sep" />
            <div className="dato-item">
              <span className="dato-valor">
                {campoConPropietario.mejoras === "Sí" ? "Sí" : "No"}
              </span>
              <span className="dato-label">Mejoras</span>
            </div>
          </div>

          {/* Descripción */}
          {campoConPropietario.descripcion && (
            <div className="ficha-seccion">
              <h2 className="ficha-seccion-titulo">Descripción</h2>
              <p className="ficha-descripcion">
                {campoConPropietario.descripcion}
              </p>
            </div>
          )}

          {/* Ambiente */}
          {campoConPropietario.ambiente && (
            <div className="ficha-seccion">
              <h2 className="ficha-seccion-titulo">Ambiente y suelo</h2>
              <p className="ficha-descripcion">
                {campoConPropietario.ambiente}
              </p>
            </div>
          )}
        </div>

        {/* Sidebar de contacto */}
        <aside className="ficha-sidebar">
          <div className="ficha-precio-card">
            {campoConPropietario.precio ? (
              <div className="ficha-precio">
                <span className="precio-valor">
                  {campoConPropietario.moneda}{" "}
                  {Number(campoConPropietario.precio).toLocaleString("es-AR")}
                </span>
                <span className="precio-unit">total estimado</span>
                <span className="precio-total">
                  Total publicado: {campoConPropietario.moneda}{" "}
                  {Number(campoConPropietario.precio).toLocaleString("es-AR")}
                </span>
              </div>
            ) : (
              <p className="precio-consultar">Precio a consultar</p>
            )}

            <ConsultaButton
              campoId={campoConPropietario.id}
              propietarioId={campoConPropietario.propietario?.id}
              userId={user?.id}
            />
            <FavoritoBtn campoId={campoConPropietario.id} userId={user?.id} />
          </div>

          {/* Info propietario */}
          {campoConPropietario.propietario && (
            <div className="ficha-propietario">
              <div className="propietario-avatar">
                {campoConPropietario.propietario.avatar_url ? (
                  <Image
                    src={campoConPropietario.propietario.avatar_url}
                    alt={campoConPropietario.propietario.nombre}
                    fill
                    sizes="56px"
                  />
                ) : (
                  <span>
                    {campoConPropietario.propietario.nombre?.[0]?.toUpperCase()}
                  </span>
                )}
              </div>
              <div className="propietario-info">
                <span className="propietario-nombre">
                  {campoConPropietario.propietario.nombre}
                </span>
                <span className="propietario-provincia">
                  {campoConPropietario.propietario.apellido ??
                    "Propietario RentoCampo"}
                </span>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
