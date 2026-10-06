import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import MisServiciosLista from "@/components/servicios/MisServiciosLista";
import "@/styles/dashboard.css";
import "@/styles/campos.css";

export default async function MisServiciosRuralesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: publicaciones } = await supabase
    .from("servicios_publicaciones")
    .select("id, servicios_rurales, foto_url, provincia, localidad, zona, activo")
    .eq("propietario_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Mis servicios rurales</h1>
          <p className="page-subtitle">Tus publicaciones de servicios rurales.</p>
        </div>
        <Link href="/mis-servicios-rurales/nuevo" className="btn-primary-lg">
          + Publicar nuevo servicio
        </Link>
      </div>

      {!publicaciones?.length ? (
        <div className="empty-state">
          <span className="empty-icon">⚙️</span>
          <p className="empty-title">Todavía no publicaste servicios rurales</p>
          <p className="empty-desc">Creá una publicación por servicio o zona. Podés publicar todas las que necesites.</p>
          <Link href="/mis-servicios-rurales/nuevo" className="btn-primary-lg">Publicar servicio</Link>
        </div>
      ) : (
        <MisServiciosLista publicaciones={publicaciones ?? []} />
      )}
    </div>
  );
}