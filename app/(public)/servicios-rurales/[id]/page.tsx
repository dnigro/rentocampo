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

export default async function ServicioDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: publicacion } = await supabase.from("servicios_publicaciones")
    .select("id, propietario_id, servicios_rurales, foto_url, provincia, localidad, zona, detalle, activo")
    .eq("id", id).eq("activo", true).maybeSingle();

  const { data: demo } = !publicacion
    ? await supabase.from("demo_servicios_rurales")
        .select("id, nombre, bio, servicios_rurales, zona_servicio, provincia_servicio, localidad_servicio")
        .eq("id", id).eq("activo", true).maybeSingle()
    : { data: null };

  if (!publicacion && !demo) notFound();

  const { data: perfil } = publicacion
    ? await supabase.from("profiles").select("nombre").eq("id", publicacion.propietario_id).maybeSingle()
    : { data: null };

  const esDemo = Boolean(demo);
  const rubros = (publicacion?.servicios_rurales ?? demo?.servicios_rurales ?? []) as ServicioRural[];
  const titulo = rubros.map((item) => SERVICIO_LABEL[item] ?? item).join(" · ");
  const nombre = perfil?.nombre ?? demo?.nombre ?? "Prestador rural";
  const provincia = publicacion?.provincia ?? demo?.provincia_servicio;
  const localidad = publicacion?.localidad ?? demo?.localidad_servicio;
  const zona = publicacion?.zona ?? demo?.zona_servicio;
  const descripcion = publicacion?.detalle ?? demo?.bio;
  const foto = publicacion?.foto_url || "/demo-servicio-veterinaria.jpg";

  return (
    <div className="ficha-container servicio-ficha">
      <Link href="/campos/mapa?vista=servicios" className="servicio-ficha-volver">
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
              <p className="ficha-descripcion">Este servicio es un ejemplo de RentoCampo. No representa una oferta comercial activa y no admite consultas.</p>
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
