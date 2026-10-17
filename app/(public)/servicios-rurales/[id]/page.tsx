import type { Metadata } from "next";
import { resolveCountry } from "@/data/countries";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SERVICIO_LABEL } from "@/data/servicios-rurales";
import type { ServicioRural } from "@/types";
import "@/styles/servicios-rurales.css";
import "@/styles/campos.css";
import "@/styles/ficha.css";
import "@/styles/servicio-ficha.css";


const SITE_URL = "https://rentocampo.com";

// Only active, authentic services should be offered to search engines.
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: publicacion } = await supabase
    .from("servicios_publicaciones")
    .select("id, servicios_rurales, provincia, localidad, detalle, activo, country_code")
    .eq("id", id)
    .eq("activo", true)
    .maybeSingle();

  if (!publicacion) {
    return {
      title: "Servicio rural de ejemplo o no disponible | RentoCampo",
      robots: { index: false, follow: true },
      alternates: { canonical: `${SITE_URL}/servicios-rurales/${id}` },
    };
  }

  const rubros = ((publicacion.servicios_rurales ?? []) as ServicioRural[])
    .map((item) => SERVICIO_LABEL[item] ?? item);
  const actividad = rubros.slice(0, 2).join(" y ") || "Servicios rurales";
  const ubicacion = [publicacion.localidad, publicacion.provincia].filter(Boolean).join(", ");
  const title = `${actividad}${ubicacion ? ` en ${ubicacion}` : ""} | RentoCampo`;
  const description = publicacion.detalle?.trim()
    ? String(publicacion.detalle).trim().slice(0, 155)
    : `Encontrá ${actividad.toLowerCase()}${ubicacion ? ` en ${ubicacion}` : ""} y contactá directamente al prestador en RentoCampo.`;
  const url = `${SITE_URL}/servicios-rurales/${id}`;

  return {
    title,
    description,
    robots: { index: true, follow: true },
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "website" },
  };
}


export default async function ServicioDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: publicacion } = await supabase.from("servicios_publicaciones")
    .select("id, propietario_id, servicios_rurales, foto_url, provincia, localidad, zona, detalle, activo, country_code")
    .eq("id", id).eq("activo", true).maybeSingle();

  const { data: demo } = !publicacion
    ? await supabase.from("demo_servicios_rurales")
        .select("id, nombre, bio, servicios_rurales, zona_servicio, provincia_servicio, localidad_servicio, country_code, imagen_url")
        .eq("id", id).eq("activo", true).maybeSingle()
    : { data: null };

  if (!publicacion && !demo) notFound();

  const { data: perfil } = publicacion
    ? await supabase.from("profiles").select("nombre").eq("id", publicacion.propietario_id).maybeSingle()
    : { data: null };

  const pais = resolveCountry(publicacion?.country_code, demo?.country_code);
  const esDemo = Boolean(demo);
  const rubros = (publicacion?.servicios_rurales ?? demo?.servicios_rurales ?? []) as ServicioRural[];
  const titulo = rubros.map((item) => SERVICIO_LABEL[item] ?? item).join(" · ");
  const nombre = perfil?.nombre ?? demo?.nombre ?? "Prestador rural";
  const provincia = publicacion?.provincia ?? demo?.provincia_servicio;
  const localidad = publicacion?.localidad ?? demo?.localidad_servicio;
  const zona = publicacion?.zona ?? demo?.zona_servicio;
  const descripcion = publicacion?.detalle ?? demo?.bio;
  const foto = publicacion?.foto_url || demo?.imagen_url || "/demo-servicio-veterinaria.jpg";

  const serviceJsonLd = !esDemo ? {
    "@context": "https://schema.org",
    "@type": "Service",
    name: titulo || "Servicio rural",
    description: descripcion || undefined,
    url: `${SITE_URL}/servicios-rurales/${id}`,
    provider: perfil?.nombre ? { "@type": "Person", name: perfil.nombre } : undefined,
    areaServed: provincia ? {
      "@type": "AdministrativeArea",
      name: [localidad, provincia].filter(Boolean).join(", "),
    } : undefined,
  } : null;

  return (
    <div className="ficha-container servicio-ficha">
      {serviceJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(serviceJsonLd).replace(/</g, "\\u003c"),
          }}
        />
      )}
      <Link href={`/campos/mapa?vista=servicios&pais=${pais}`} className="servicio-ficha-volver">
        ← Volver al mapa de servicios
      </Link>

      <div className="servicio-ficha-galeria">
        <Image src={foto} alt={titulo || nombre} fill sizes="(max-width: 768px) 100vw, 1180px" priority />
      </div>

      <div className="ficha-body">
        <main className="ficha-main">
          <div className="ficha-tags">
            <span className="aptitud-tag">{esDemo ? "Servicio demo" : "Servicio rural"}</span>
          </div>
          <h1 className="ficha-titulo">{titulo || nombre}</h1>
          <p className="ficha-ubicacion">📍 {[localidad, provincia].filter(Boolean).join(", ")}</p>

          <div className="ficha-datos">
            <div className="dato-item">
              <span className="dato-valor">{rubros.length}</span>
              <span className="dato-label">{rubros.length === 1 ? "Actividad" : "Actividades"}</span>
            </div>
            {zona && (
              <>
                <div className="dato-sep" />
                <div className="dato-item">
                  <span className="dato-valor">{zona}</span>
                  <span className="dato-label">Zona de cobertura</span>
                </div>
              </>
            )}
          </div>
          {descripcion && (
            <section className="ficha-seccion">
              <h2 className="ficha-seccion-titulo">Descripción</h2>
              <p className="ficha-descripcion">{descripcion}</p>
            </section>
          )}
        </main>

        <aside className="ficha-sidebar">
          <div className="ficha-precio-card">
            <strong className="servicio-ficha-card-titulo">{esDemo ? "Publicación demostrativa" : "Consultar servicio"}</strong>
            {esDemo ? (
              <>
                <p className="ficha-descripcion">Este servicio es un ejemplo de RentoCampo. No representa una oferta comercial activa y no admite consultas.</p>
                <Link href={user ? "/servicios-rurales" : `/login?next=/servicios-rurales/${id}`} className="servicio-ficha-cta">
                  {user ? "Ver servicios disponibles →" : "Ingresá para consultar →"}
                </Link>
              </>
            ) : user?.id === publicacion?.propietario_id ? (
              <Link href={`/mis-servicios-rurales/${publicacion?.id}/editar`} className="servicio-ficha-cta">Editar publicación</Link>
            ) : user ? (
              <Link href={`/mensajes/direct/${publicacion?.propietario_id}`} className="servicio-ficha-cta">Consultar servicio →</Link>
            ) : (
              <Link href={`/login?next=/servicios-rurales/${id}`} className="servicio-ficha-cta">Ingresá para consultar →</Link>
            )}
          </div>
          <div className="ficha-propietario">
            <div className="propietario-avatar"><span>{nombre.charAt(0).toUpperCase()}</span></div>
            <div className="propietario-info">
              <span className="propietario-nombre">{nombre}</span>
              <span className="propietario-provincia">{esDemo ? "Perfil demostrativo" : "Prestador RentoCampo"}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
