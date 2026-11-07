import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import ServicioRuralForm from "@/components/servicios/ServicioRuralForm";
import { resolveCountry } from "@/data/countries";
import "@/styles/perfil.css";
import "@/styles/campos.css";

export default async function NuevoServicioRuralPage({ searchParams }: { searchParams?: Promise<{pais?:string;zona?:string}> }) {
  const search = searchParams ? await searchParams : {};
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await createAdminClient().from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="page-container perfil-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Publicar servicio rural
          </h1>
        </div>
      </div>

      <ServicioRuralForm profile={profile} initialCountry={resolveCountry(search.pais, profile?.country_code)} initialZona={search.zona} />
    </div>
  );
}
