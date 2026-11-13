import { cookies } from "next/headers";
import { resolveCountry } from "@/data/countries";
import { regionalText } from "@/lib/i18n/regional";
import { createClient } from "@/lib/supabase/server";
import Link from "@/components/layout/SiteLink";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Profile } from "@/types";
import { redirect } from "next/navigation";
import PerfilForm from "@/components/PerfilForm";
import DashboardReturn from "@/components/layout/DashboardReturn";
import SeleccionarActividad from "@/components/auth/SeleccionarActividad";
import "@/styles/perfil.css";

export default async function PerfilPage({ searchParams }: { searchParams?: Promise<{ pais?: string }> } = {}) {
  const country = resolveCountry((await searchParams)?.pais, (await cookies()).get("rentocampo_country")?.value);
  const tt = (es: string, pt: string, en: string) => regionalText(country, es, pt, en);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Phone is deliberately unavailable through public/authenticated column grants.
  // Keep the privileged reader server-side and scoped to the verified user's own ID.
  let profile: Profile | null = null;
  let profileError = false;
  try {
    const result = await createAdminClient().from("profiles").select("*").eq("id",user.id).maybeSingle();
    profile = result.data as Profile | null;
    profileError = Boolean(result.error);
  } catch { profileError = true; }

  if (profileError || (!profile && user.user_metadata?.onboarding_pending_roles !== true)) return <div className="page-container perfil-page"><h1>{tt("Mi perfil", "Meu perfil", "My profile")}</h1><p role="alert">{tt("No pudimos cargar tu perfil. Tus datos no se modificaron. Volvé a intentarlo.", "Não foi possível carregar seu perfil. Seus dados não foram alterados. Tente novamente.", "We couldn't load your profile. Your data has not changed. Please try again.")}</p><Link href={`/perfil?pais=${country}`}>{tt("Volver a intentar", "Tentar novamente", "Try again")}</Link></div>;

  return (
    <div className="page-container perfil-page">
      <DashboardReturn embedded />
      <div className="page-header">
        <div>
          <h1 className="page-title">{tt("Mi perfil", "Meu perfil", "My profile")}</h1>
          <p className="page-subtitle">{user.user_metadata?.onboarding_pending_roles === true ? tt("Elegí cómo querés usar RentoCampo", "Escolha como deseja usar a RentoCampo", "Choose how you want to use RentoCampo") : tt("Editá tus datos personales", "Edite seus dados pessoais", "Manage your personal information")}</p>
        </div>
      </div>
      {user.user_metadata?.onboarding_pending_roles === true ? (
        <SeleccionarActividad country={country} />
      ) : (
        <PerfilForm profile={profile} email={user.email ?? ""} country={country} />
      )}
    </div>
  );
}
