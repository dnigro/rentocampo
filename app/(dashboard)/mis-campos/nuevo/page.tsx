import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CampoForm from "@/components/campos/CampoForm";
import "@/styles/campos.css";

export default async function NuevoCampoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Publicar campo</h1>
          <p className="page-subtitle">
            Completá los datos de tu campo para que los productores puedan
            encontrarlo
          </p>
        </div>
      </div>
      <CampoForm />
    </div>
  );
}
