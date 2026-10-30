import { cookies } from "next/headers";
import { resolveCountry } from "@/data/countries";
import { regionalText } from "@/lib/i18n/regional";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PerfilForm from "@/components/PerfilForm";
import "@/styles/perfil.css";

export default async function PerfilPage() {
  const country = resolveCountry((await cookies()).get("rentocampo_country")?.value);
  const tt = (es: string, pt: string, en: string) => regionalText(country, es, pt, en);
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

  return (
    <div className="page-container perfil-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{tt("Mi perfil", "Meu perfil", "My profile")}</h1>
          <p className="page-subtitle">{user.user_metadata?.onboarding_pending_roles === true ? tt("Elegí cómo querés usar RentoCampo", "Escolha como deseja usar a RentoCampo", "Choose how you want to use RentoCampo") : tt("Editá tus datos personales", "Edite seus dados pessoais", "Manage your personal information")}</p>
        </div>
      </div>
      <PerfilForm profile={profile} email={user.email ?? ""} country={country} onboardingPending={user.user_metadata?.onboarding_pending_roles === true} />
    </div>
  );
}
