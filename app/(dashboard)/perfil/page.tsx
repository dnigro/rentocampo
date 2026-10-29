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
          <p className="page-subtitle">{tt("Editá tus datos personales", "Edite seus dados pessoais", "Manage your personal information")}</p>
        </div>
      </div>
      <PerfilForm profile={profile} email={user.email ?? ""} country={country} />
    </div>
  );
}
