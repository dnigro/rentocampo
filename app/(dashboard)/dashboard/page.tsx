import AccountOverview from "@/components/account/AccountOverview";
import { isV3Preview } from "@/lib/v3-routing";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "@/components/layout/RegionalLink";
import { ArrowUpRight } from "lucide-react";
import ActionIcon from "@/components/ui/ActionIcon";
import "@/styles/dashboard.css";
import { canAccessManagementReport } from "@/lib/analytics/commercial-filters";
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
  const canViewCommercialReport = Boolean(user.email_confirmed_at) && canAccessManagementReport(user.email);

  const { data: profile } = await supabase
    .from("profiles")
    .select("nombre, roles")
    .eq("id", user.id)
    .single();

  const roles = profile?.roles ?? [];
  const esPropietario = roles.includes("propietario");
  const esProductor = roles.includes("productor");
  const esPrestador = roles.includes("prestador");
  const etiquetaPerfil = [
    esProductor ? tt("Productor", "Produtor") : null,
    esPropietario ? tt("Propietario", "Proprietário") : null,
    esPrestador ? tt("Servicios rurales", "Serviços rurais") : null,
  ].filter(Boolean).join(" · ");

  if (isV3Preview(process.env)) return <AccountOverview name={profile?.nombre} roles={roles} country={country} canViewReport={canViewCommercialReport}/>;

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">
            {tt("Hola", "Olá")}, {profile?.nombre?.split(" ")[0] ?? tt("bienvenido", "bem-vindo")}
          </h1>
        </div>
        <span className={`badge-tipo ${esPropietario ? "propietario" : esPrestador ? "prestador" : "productor"}`}>
          {etiquetaPerfil}
        </span>
      </div>

      <div className="dashboard-cards">
        {canViewCommercialReport && (
          <Link href="/gerencial" className="dash-card">
            <span className="dash-card-icon"><ActionIcon name="report" /></span>
            <span className="dash-card-label">{tt("Reporte gerencial", "Relatório gerencial")}</span>
            <span className="dash-card-desc">{tt("Registros, campos y servicios reales por país", "Cadastros, terras e serviços reais por país")}</span>
          <ArrowUpRight className="dash-card-arrow" size={18} aria-hidden="true"/></Link>
        )}
        <Link href="/perfil" className="dash-card">
          <span className="dash-card-icon"><ActionIcon name="profile" /></span>
          <span className="dash-card-label">{tt("Mi perfil", "Meu perfil")}</span>
          <span className="dash-card-desc">{tt("Datos y configuración", "Dados e configurações")}</span>
        <ArrowUpRight className="dash-card-arrow" size={18} aria-hidden="true"/></Link>
        {(esProductor || esPropietario) && (
          <Link href="/mis-campos" className="dash-card">
            <span className="dash-card-icon"><ActionIcon name="fields" /></span>
            <span className="dash-card-label">{tt("Mis campos", "Minhas terras")}</span>
            <span className="dash-card-desc">{tt("Publicar y gestionar", "Anunciar e gerenciar")}</span>
          <ArrowUpRight className="dash-card-arrow" size={18} aria-hidden="true"/></Link>
        )}
        {esPrestador && (
          <Link href="/mis-servicios-rurales" className="dash-card">
            <span className="dash-card-icon"><ActionIcon name="services" /></span>
            <span className="dash-card-label">{tt("Mis servicios rurales", "Meus serviços rurais")}</span>
            <span className="dash-card-desc">{tt("Publicar y gestionar", "Anunciar e gerenciar")}</span>
          <ArrowUpRight className="dash-card-arrow" size={18} aria-hidden="true"/></Link>
        )}
        <Link href="/favoritos" className="dash-card">
          <span className="dash-card-icon"><ActionIcon name="favorites" /></span>
          <span className="dash-card-label">{tt("Favoritos", "Favoritos")}</span>
          <span className="dash-card-desc">{tt("Campos guardados", "Terras salvas")}</span>
        <ArrowUpRight className="dash-card-arrow" size={18} aria-hidden="true"/></Link>
        <Link href="/mensajes" className="dash-card">
          <span className="dash-card-icon"><ActionIcon name="messages" /></span>
          <span className="dash-card-label">{tt("Mensajes", "Mensagens")}</span>
          <span className="dash-card-desc">{tt("Mis consultas", "Minhas consultas")}</span>
        <ArrowUpRight className="dash-card-arrow" size={18} aria-hidden="true"/></Link>
      </div>
    </div>
  );
}
