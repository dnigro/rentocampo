import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import CampoCard from "@/components/campos/CampoCard";
import "@/styles/campos.css";
import "@/styles/explorador.css";
import "@/styles/favoritos.css";

export default async function FavoritosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: favoritos } = await supabase
    .from("favoritos")
    .select(
      `
      id,
      campo:campos(
        *,
        fotos:campos_fotos(url, orden)
      )
    `,
    )
    .eq("usuario_id", user.id)
    .order("created_at", { ascending: false });

  const campos =
    favoritos
      ?.map((f) => f.campo)
      .filter(Boolean)
      .filter((c: any) => c.estado === "activo") ?? [];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Favoritos</h1>
          <p className="page-subtitle">
            {campos.length > 0
              ? `${campos.length} campo${campos.length !== 1 ? "s" : ""} guardado${campos.length !== 1 ? "s" : ""}`
              : "No guardaste ningún campo todavía"}
          </p>
        </div>
        {campos.length > 0 && (
          <Link href="/campos" className="btn-secondary-lg">
            Explorar más
          </Link>
        )}
      </div>

      {campos.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">❤️</span>
          <p className="empty-title">Sin favoritos todavía</p>
          <p className="empty-desc">
            Guardá los campos que te interesan para encontrarlos fácilmente
            después.
          </p>
          <Link href="/campos" className="btn-primary-lg">
            Explorar campos
          </Link>
        </div>
      ) : (
        <div className="campos-explorador-grid">
          {campos.map((campo: any) => (
            <div key={campo.id} className="favorito-item">
              <CampoCard campo={campo} userId={user.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
