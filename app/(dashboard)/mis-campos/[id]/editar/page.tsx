import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import CampoForm from "@/components/campos/CampoForm";
import "@/styles/campos.css";

export default async function EditarCampoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: campo } = await supabase
    .from("campos")
    .select("*")
    .eq("id", id)
    .eq("propietario_id", user.id)
    .single();

  if (!campo) notFound();

  const { data: fotos } = await supabase
    .from("campos_fotos")
    .select("id, url, orden")
    .eq("campo_id", id)
    .order("orden");

  if (!campo) notFound();

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Editar campo</h1>
          <p className="page-subtitle">{campo.titulo}</p>
        </div>
      </div>
      <CampoForm
        campoId={campo.id}
        initialData={campo}
        fotosIniciales={fotos ?? []}
      />
    </div>
  );
}
