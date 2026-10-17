import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import "@/styles/dashboard.css";
import { INTERNAL_TEST_EMAILS } from "@/lib/analytics/commercial-filters";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const canViewCommercialReport = Boolean(
    user.email && INTERNAL_TEST_EMAILS.includes(user.email.trim().toLowerCase()),
  );

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const roles = profile?.roles ?? [];
  const esPropietario = roles.includes("propietario");
  const esProductor = roles.includes("productor");
  const esPrestador = roles.includes("prestador");
  const etiquetaPerfil = [
    esProductor ? "🌱 Productor" : null,
    esPropietario ? "🏡 Propietario" : null,
    esPrestador ? "⚙️ Servicios rurales" : null,
  ].filter(Boolean).join(" · ");

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">
            Hola, {profile?.nombre?.split(" ")[0] ?? "bienvenido"} 👋
          </h1>
        </div>
        <span className={`badge-tipo ${esPropietario ? "propietario" : esPrestador ? "prestador" : "productor"}`}>
          {etiquetaPerfil}
        </span>
      </div>

      <div className="dashboard-cards">
        {canViewCommercialReport && (
          <Link href="/gerencial" className="dash-card" aria-label="Abrir reporte gerencial por país">
            <span className="dash-card-icon">📊</span>
            <span className="dash-card-label">Reporte gerencial</span>
            <span className="dash-card-desc">Registros, campos y servicios reales por país</span>
          </Link>
        )}
        <Link href="/perfil" className="dash-card">
          <span className="dash-card-icon">👤</span>
          <span className="dash-card-label">Mi perfil</span>
          <span className="dash-card-desc">Datos y configuración</span>
        </Link>
        {(esProductor || esPropietario) && (
          <Link href="/mis-campos" className="dash-card">
            <span className="dash-card-icon">🗺️</span>
            <span className="dash-card-label">Mis campos</span>
            <span className="dash-card-desc">Publicar y gestionar</span>
          </Link>
        )}
        {esPrestador && (
          <Link href="/mis-servicios-rurales" className="dash-card">
            <span className="dash-card-icon">⚙️</span>
            <span className="dash-card-label">Mis servicios rurales</span>
            <span className="dash-card-desc">Publicar y gestionar</span>
          </Link>
        )}
        <Link href="/favoritos" className="dash-card">
          <span className="dash-card-icon">❤️</span>
          <span className="dash-card-label">Favoritos</span>
          <span className="dash-card-desc">Campos guardados</span>
        </Link>
        <Link href="/mensajes" className="dash-card">
          <span className="dash-card-icon">💬</span>
          <span className="dash-card-label">Mensajes</span>
          <span className="dash-card-desc">Mis consultas</span>
        </Link>
      </div>
    </div>
  );
}
