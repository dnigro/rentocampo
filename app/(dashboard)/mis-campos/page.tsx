import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import MisCamposLista from "@/components/campos/MisCamposLista";
import "@/styles/campos.css";

export default async function MisCamposPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: campos } = await supabase
    .from("campos")
    .select("*, fotos:campos_fotos(url, orden)")
    .eq("propietario_id", user.id)
    .order("created_at", { ascending: false });

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

      <MisCamposLista campos={campos ?? []} />
    </div>
  );
}
