import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import "@/styles/dashboard.css";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const roles = profile?.roles?.length ? profile.roles : [profile?.tipo];
  const esPropietario = roles.includes("propietario");
  const esProductor = roles.includes("productor");
  const etiquetaPerfil =
    esPropietario && esProductor
      ? "🌱🏡 Productor y propietario"
      : esPropietario
        ? "🏡 Propietario"
        : "🌱 Productor";

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">
            Hola, {profile?.nombre?.split(" ")[0] ?? "bienvenido"} 👋
          </h1>
          <p className="dashboard-subtitle">
            {esPropietario
              ? "Buscá oportunidades y administrá tus campos"
              : "Explorá campos disponibles y contactá propietarios"}
          </p>
        </div>
        <span className={`badge-tipo ${esPropietario ? "propietario" : "productor"}`}>
          {etiquetaPerfil}
        </span>
      </div>

      <div className="dashboard-cards">
        {esPropietario ? (
          <>
            <Link href="/mis-campos" className="dash-card">
              <span className="dash-card-icon">🗺️</span>
              <span className="dash-card-label">Mis campos</span>
              <span className="dash-card-desc">Publicar y gestionar</span>
            </Link>
            <Link href="/favoritos" className="dash-card">
              <span className="dash-card-icon">❤️</span>
              <span className="dash-card-label">Favoritos</span>
              <span className="dash-card-desc">Campos guardados</span>
            </Link>
            <Link href="/mensajes" className="dash-card">
              <span className="dash-card-icon">💬</span>
              <span className="dash-card-label">Consultas</span>
              <span className="dash-card-desc">Mensajes de productores</span>
            </Link>
            <Link href="/perfil" className="dash-card">
              <span className="dash-card-icon">👤</span>
              <span className="dash-card-label">Mi perfil</span>
              <span className="dash-card-desc">Datos y configuración</span>
            </Link>
          </>
        ) : (
          <>
            <Link href="/campos" className="dash-card">
              <span className="dash-card-icon">🔍</span>
              <span className="dash-card-label">Buscar campos</span>
              <span className="dash-card-desc">Explorar disponibles</span>
            </Link>
            <Link href="/mis-campos" className="dash-card">
              <span className="dash-card-icon">🗺️</span>
              <span className="dash-card-label">Mis campos</span>
              <span className="dash-card-desc">Publicar y gestionar</span>
            </Link>
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
            <Link href="/perfil" className="dash-card">
              <span className="dash-card-icon">👤</span>
              <span className="dash-card-label">Mi perfil</span>
              <span className="dash-card-desc">Datos y configuración</span>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
