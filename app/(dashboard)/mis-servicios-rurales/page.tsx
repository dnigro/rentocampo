import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import MisServiciosLista from "@/components/servicios/MisServiciosLista";
import { cookies } from "next/headers";
import { resolveCountry } from "@/data/countries";
import { regionalText } from "@/lib/i18n/regional";
import "@/styles/dashboard.css";
import "@/styles/campos.css";

export default async function MisServiciosRuralesPage() {
  const country=resolveCountry((await cookies()).get("rentocampo_country")?.value);
  const tt=(es:string,pt:string)=>regionalText(country,es,pt);
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
          <h1 className="page-title">{tt("Mis servicios rurales","Meus serviços rurais")}</h1>
        </div>
        <Link href="/mis-servicios-rurales/nuevo" className="btn-primary-lg">
          + {tt("Publicar nuevo servicio","Anunciar novo serviço")}
        </Link>
      </div>

      {!publicaciones?.length ? (
        <div className="empty-state">
          <span className="empty-icon">⚙️</span>
          <p className="empty-title">{tt("Todavía no publicaste servicios rurales","Você ainda não anunciou serviços rurais")}</p>
          <p className="empty-desc">{tt("Creá una publicación por servicio o zona. Podés publicar todas las que necesites.","Crie um anúncio para cada serviço ou região. Você pode publicar quantos precisar.")}</p>
          <Link href="/mis-servicios-rurales/nuevo" className="btn-primary-lg">{tt("Publicar servicio","Anunciar serviço")}</Link>
        </div>
      ) : (
        <MisServiciosLista publicaciones={publicaciones ?? []} />
      )}
    </div>
  );
}