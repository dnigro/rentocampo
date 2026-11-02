import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BarChart3, UserRound, Tractor, Heart, Mail, Wrench } from "lucide-react";
import "@/styles/dashboard.css";
import { INTERNAL_TEST_EMAILS } from "@/lib/analytics/commercial-filters";
import { cookies } from "next/headers";
import { resolveCountry } from "@/data/countries";
import { regionalText } from "@/lib/i18n/regional";

export default async function DashboardPage() {
  const country=resolveCountry((await cookies()).get("rentocampo_country")?.value);
  const tt=(es:string,pt:string)=>regionalText(country,es,pt);
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (user.user_metadata?.onboarding_pending_roles === true) {
    redirect("/perfil?elegir=rol");
  }
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
    esProductor ? tt("🌱 Productor", "🌱 Produtor") : null,
    esPropietario ? tt("🏡 Propietario", "🏡 Proprietário") : null,
    esPrestador ? tt("Servicios rurales", "Serviços rurais") : null,
  ].filter(Boolean).join(" · ");

  return (
    <div className="dashboard-page">
      <div className="dashboard-header rc-reference-hero rc-hero-cows">
        <div>
          <h1 className="dashboard-title">
            {tt("Hola", "Olá")}, {profile?.nombre?.split(" ")[0] ?? tt("bienvenido", "bem-vindo")} 👋
          </h1>
          <p className="rc-hero-caption">{tt("Gestioná tus campos, servicios y mensajes en un solo lugar.", "Gerencie suas terras, serviços e mensagens em um só lugar.")}</p>
        </div>
        <span className={`badge-tipo ${esPropietario ? "propietario" : esPrestador ? "prestador" : "productor"}`}>
          {etiquetaPerfil}
        </span>
      </div>

      <div className="dashboard-cards">
        {canViewCommercialReport && (
          <Link href="/gerencial" className="dash-card" aria-label={tt("Abrir reporte gerencial por país", "Abrir relatório gerencial por país")}>
            <span className="dash-card-icon"><BarChart3 aria-hidden="true" /></span>
            <span className="dash-card-label">{tt("Reporte gerencial", "Relatório gerencial")}</span>
            <span className="dash-card-desc">{tt("Registros, campos y servicios reales por país", "Cadastros, terras e serviços reais por país")}</span>
          </Link>
        )}
        <Link href="/perfil" className="dash-card">
          <span className="dash-card-icon"><UserRound aria-hidden="true" /></span>
          <span className="dash-card-label">{tt("Mi perfil", "Meu perfil")}</span>
          <span className="dash-card-desc">{tt("Datos y configuración", "Dados e configurações")}</span>
        </Link>
        {(esProductor || esPropietario) && (
          <Link href="/mis-campos" className="dash-card">
            <span className="dash-card-icon"><Tractor aria-hidden="true" /></span>
            <span className="dash-card-label">{tt("Mis campos", "Minhas terras")}</span>
            <span className="dash-card-desc">{tt("Publicar y gestionar", "Anunciar e gerenciar")}</span>
          </Link>
        )}
        {esPrestador && (
          <Link href="/mis-servicios-rurales" className="dash-card">
            <span className="dash-card-icon"><Wrench aria-hidden="true" /></span>
            <span className="dash-card-label">{tt("Mis servicios rurales", "Meus serviços rurais")}</span>
            <span className="dash-card-desc">{tt("Publicar y gestionar", "Anunciar e gerenciar")}</span>
          </Link>
        )}
        <Link href="/favoritos" className="dash-card">
          <span className="dash-card-icon"><Heart aria-hidden="true" /></span>
          <span className="dash-card-label">{tt("Favoritos", "Favoritos")}</span>
          <span className="dash-card-desc">{tt("Campos guardados", "Terras salvas")}</span>
        </Link>
        <Link href="/mensajes" className="dash-card">
          <span className="dash-card-icon"><Mail aria-hidden="true" /></span>
          <span className="dash-card-label">{tt("Mensajes", "Mensagens")}</span>
          <span className="dash-card-desc">{tt("Mis consultas", "Minhas consultas")}</span>
        </Link>
      </div>
    </div>
  );
}
