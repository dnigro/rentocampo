import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SERVICIO_LABEL } from "@/data/servicios-rurales";
import type { ServicioRural } from "@/types";
import "@/styles/dashboard.css";
import "@/styles/campos.css";

export default async function MisServiciosRuralesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "roles, service_photo_url, servicios_rurales, zona_servicio, provincia_servicio, localidad_servicio",
    )
    .eq("id", user.id)
    .single();

  const servicios = (profile?.servicios_rurales ?? []) as ServicioRural[];
  const esPrestador = profile?.roles?.includes("prestador");

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Mis servicios rurales</h1>
          <p className="page-subtitle">Tus publicaciones de servicios activas.</p>
        </div>
        <Link href="/mis-servicios-rurales/nuevo" className="btn-primary-lg">
          {servicios.length ? "Editar servicios" : "Publicar servicio"}
        </Link>
      </div>

      {!esPrestador || servicios.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">⚙️</span>
          <p className="empty-title">Todavía no publicaste servicios rurales</p>
          <p className="empty-desc">
            Elegí qué trabajos ofrecés y la zona donde trabajás para aparecer en RentoCampo.
          </p>
          <Link href="/mis-servicios-rurales/nuevo" className="btn-primary-lg">
            Publicar mis servicios
          </Link>
        </div>
      ) : (
        <div className="campos-grid">
          {servicios.map((servicio) => (
            <article className="campo-card-admin" key={servicio}>
              {profile?.service_photo_url && (
                <div className="campo-card-img">
                  <Image
                    src={profile.service_photo_url}
                    alt={`${SERVICIO_LABEL[servicio] ?? servicio} · servicio rural`}
                    fill
                    sizes="(max-width: 720px) 100vw, 320px"
                  />
                </div>
              )}
              <div className="campo-card-body">
                <span className="estado-badge estado-activo" style={{ position: "static", display: "inline-flex", marginBottom: 12 }}>
                  Activo
                </span>
                <h2 className="campo-card-titulo">
                  {SERVICIO_LABEL[servicio] ?? servicio}
                </h2>
                <p className="campo-card-ubicacion">
                  📍 {[profile?.localidad_servicio, profile?.provincia_servicio]
                    .filter(Boolean)
                    .join(", ") || "Zona a definir"}
                </p>
                {profile?.zona_servicio && (
                  <p className="campo-card-datos">{profile.zona_servicio}</p>
                )}
              </div>
              <div className="campo-card-actions">
                <Link href="/mis-servicios-rurales/nuevo" className="btn-action">
                  Editar
                </Link>
                <Link href="/servicios-rurales" className="btn-action">
                  Ver publicación
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
