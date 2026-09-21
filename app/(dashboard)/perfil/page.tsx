import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PerfilForm from "@/components/PerfilForm";
import "@/styles/perfil.css";

export default async function PerfilPage() {
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
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Mi perfil</h1>
          <p className="page-subtitle">Editá tus datos personales</p>
        </div>
      </div>
      <PerfilForm profile={profile} userId={user.id} email={user.email ?? ""} />
    </div>
  );
}
