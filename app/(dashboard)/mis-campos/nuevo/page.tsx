import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CampoForm from "@/components/campos/CampoForm";
import { getLandQuotaStatus } from "@/lib/billing/land-quota";
import { resolveCountry } from "@/data/countries";
import { regionalText } from "@/lib/i18n/regional";
import "@/styles/campos.css";
import "@/styles/campo-location-improvements.css";

export default async function NuevoCampoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const quota = await getLandQuotaStatus(user.id);
  const { data: profile } = await supabase
    .from("profiles")
    .select("country_code")
    .eq("id", user.id)
    .single();
  const initialCountry = resolveCountry(profile?.country_code);
  const tt=(es:string,pt:string)=>regionalText(initialCountry,es,pt);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">{tt("Publicar campo","Anunciar terra")}</h1>
          <p className="page-subtitle">
            {tt("Completá los datos de tu campo para que los productores puedan encontrarlo.","Preencha os dados da propriedade para que os produtores possam encontrá-la.")}
          </p>
        </div>
      </div>
      <CampoForm
        planNombre={quota.planName}
        publicacionesUsadas={quota.used}
        publicacionesLimite={quota.limit}
        publicacionesRestantes={quota.remaining}
        puedePublicar={quota.canPublish}
        initialCountry={initialCountry}
      />
    </div>
  );
}
