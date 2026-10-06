import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ServicioRuralForm from "@/components/servicios/ServicioRuralForm";
import "@/styles/perfil.css";
import "@/styles/campos.css";

export default async function EditarServicioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const [{ data: profile }, { data: publicacion }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("servicios_publicaciones").select("*").eq("id", id).eq("propietario_id", user.id).single(),
  ]);
  if (!publicacion) notFound();
  return <div className="page-container">
    <Link href="/mis-servicios-rurales" className="back-link">← Volver a Mis servicios rurales</Link>
    <div className="page-header"><div><h1 className="page-title">Editar servicio rural</h1></div></div>
    <ServicioRuralForm profile={profile} publicacion={publicacion} />
  </div>;
}