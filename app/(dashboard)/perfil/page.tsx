import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PerfilForm from "@/components/PerfilForm";
import PlanesTierra from "@/components/planes/PlanesTierra";
import "@/styles/perfil.css";

export default async function PerfilPage({
  searchParams,
}: {
  searchParams: Promise<{ previewPlanes?: string }>;
}) {
  const { previewPlanes } = await searchParams;
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

  const esPropietario = profile?.roles?.includes("propietario") ?? false;
  let publicacionesUsadas = 0;

  if (esPropietario) {
    const { data: camposPropietario } = await supabase
      .from("campos")
      .select("id")
      .eq("propietario_id", user.id);

    publicacionesUsadas = (camposPropietario ?? []).filter(
      (campo) => !campo.id.startsWith("20000000-"),
    ).length;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Mi perfil</h1>
          <p className="page-subtitle">Editá tus datos personales</p>
        </div>
      </div>
      {(esPropietario || previewPlanes === "1") && (
        <PlanesTierra publicacionesUsadas={publicacionesUsadas} />
      )}
      <PerfilForm profile={profile} userId={user.id} email={user.email ?? ""} />
    </div>
  );
}
