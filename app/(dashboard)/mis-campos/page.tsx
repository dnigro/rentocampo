import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import MisCamposLista from "@/components/campos/MisCamposLista";
import PlanesTierra from "@/components/planes/PlanesTierra";
import "@/styles/perfil.css";
import "@/styles/campos.css";

export default async function MisCamposPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("roles")
    .eq("id", user.id)
    .single();

  const esPropietario = profile?.roles?.includes("propietario");
  if (!esPropietario) redirect("/perfil?activar=propietario");

  const { data: campos } = await supabase
    .from("campos")
    .select("*, fotos:campos_fotos(url, orden)")
    .eq("propietario_id", user.id)
    .order("created_at", { ascending: false });

  const publicacionesUsadas = (campos ?? []).filter(
    (campo) => !campo.id.startsWith("20000000-"),
  ).length;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Mis campos</h1>
          <p className="page-subtitle">
            {campos?.length
              ? `${campos.length} campo${campos.length !== 1 ? "s" : ""} publicado${campos.length !== 1 ? "s" : ""}`
              : "Todavía no publicaste ningún campo"}
          </p>
        </div>
        <Link href="/mis-campos/nuevo" className="btn-primary-lg">
          + Publicar campo
        </Link>
      </div>

      <PlanesTierra publicacionesUsadas={publicacionesUsadas} />
      <MisCamposLista campos={campos ?? []} />
    </div>
  );
}
