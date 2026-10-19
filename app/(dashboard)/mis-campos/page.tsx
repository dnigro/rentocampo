import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import MisCamposLista from "@/components/campos/MisCamposLista";
import PlanesTierra from "@/components/planes/PlanesTierra";
import { getLandQuotaStatus } from "@/lib/billing/land-quota";
import { getPlanExpiryDays } from "@/lib/billing/plan-expiry";
import { isCountryCode, resolveCountry } from "@/data/countries";
import { regionalText } from "@/lib/i18n/regional";
import { cookies } from "next/headers";
import "@/styles/perfil.css";
import "@/styles/campos.css";

export default async function MisCamposPage() {
  const country=resolveCountry((await cookies()).get("rentocampo_country")?.value);
  const tt=(es:string,pt:string)=>regionalText(country,es,pt);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("roles,country_code")
    .eq("id", user.id)
    .single();

  const esPropietario = profile?.roles?.includes("propietario");

  if (!esPropietario) {
    return (
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">{tt("Mis campos","Minhas terras")}</h1>
            <p className="page-subtitle">{tt("Publicá y administrá tus campos desde acá.","Anuncie e gerencie suas terras aqui.")}</p>
          </div>
        </div>

        <div className="role-gate-card">
          <div className="role-gate-icon">🌾</div>
          <h2>{tt("Para publicar campos tenés que cambiar tu rol a Propietario","Para anunciar terras, ative o perfil de Proprietário")}</h2>
          <p>
            {tt("Podés hacerlo desde Mi perfil. Activá el rol Propietario y después volvé a Mis campos para comenzar a publicar.","Faça isso em Meu perfil. Ative o perfil Proprietário e volte a Minhas terras para começar a anunciar.")}
          </p>
          <Link href="/perfil?activar=propietario" className="btn-primary-lg">
            {tt("Cambiar mi rol en el perfil","Alterar meu perfil")}
          </Link>
        </div>
      </div>
    );
  }

  const { data: campos } = await supabase
    .from("campos")
    .select("*, fotos:campos_fotos(url, orden)")
    .eq("propietario_id", user.id)
    .order("created_at", { ascending: false });

  const publicacionesReales = (campos ?? []).filter(
    (campo) => !campo.id.startsWith("20000000-"),
  ).length;
  const quota = await getLandQuotaStatus(user.id);
  const expiryDate = quota.expiresAt ? new Date(quota.expiresAt) : null;
  const expiryDays = quota.expiresAt
    ? getPlanExpiryDays(quota.expiresAt)
    : null;
  const expiryLabel = expiryDate
    ? new Intl.DateTimeFormat(country==="BR"?"pt-BR":"es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        timeZone: "America/Argentina/Buenos_Aires",
      }).format(expiryDate)
    : null;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Mis campos</h1>
          <p className="page-subtitle">
            {campos?.length
              ? country==="BR"?`${campos.length} terra${campos.length!==1?"s":""} anunciada${campos.length!==1?"s":""}`:`${campos.length} campo${campos.length !== 1 ? "s" : ""} publicado${campos.length !== 1 ? "s" : ""}`
               : tt("Todavía no publicaste ningún campo","Você ainda não anunciou terras")}
          </p>
        </div>
        <Link href="/mis-campos/nuevo" className="btn-primary-lg">
          + {tt("Publicar campo","Anunciar terra")}
        </Link>
      </div>

      <PlanesTierra
        countryCode={isCountryCode(profile?.country_code) ? profile.country_code : null}
        planActualId={quota.planId}
        planActualNombre={quota.planName}
        publicacionesUsadas={quota.used}
        publicacionesReales={publicacionesReales}
        publicacionesLimite={quota.limit}
        publicacionesRestantes={quota.remaining}
        expiryLabel={expiryLabel}
        expiryDays={expiryDays}
      />
      <MisCamposLista campos={campos ?? []} />
    </div>
  );
}
