import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import MisCamposLista from "@/components/campos/MisCamposLista";
import { resolveCountry } from "@/data/countries";
import { regionalText } from "@/lib/i18n/regional";
import { cookies } from "next/headers";
import "@/styles/perfil.css";
import "@/styles/campos.css";

export default async function MisCamposPage() {
  const country=resolveCountry((await cookies()).get("rentocampo_country")?.value);
  const tt=(es:string,pt:string)=>regionalText(country,es,pt);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("roles,country_code")
    .eq("id", user.id)
    .single();

  const esPropietario = profile?.roles?.includes("propietario");

  if (!esPropietario) {
    return (
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">{tt("Mis campos","Minhas terras")}</h1>
            <p className="page-subtitle">{tt("Publicá y administrá tus campos desde acá.","Anuncie e gerencie suas terras aqui.")}</p>
          </div>
        </div>

        <div className="role-gate-card">
          <div className="role-gate-icon">🌾</div>
          <h2>{tt("Para publicar campos tenés que cambiar tu rol a Propietario","Para anunciar terras, ative o perfil de Proprietário")}</h2>
          <p>
            {tt("Podés hacerlo desde Mi perfil. Activá el rol Propietario y después volvé a Mis campos para comenzar a publicar.","Faça isso em Meu perfil. Ative o perfil Proprietário e volte a Minhas terras para começar a anunciar.")}
          </p>
          <Link href="/perfil?activar=propietario" className="btn-primary-lg">
            {tt("Cambiar mi rol en el perfil","Alterar meu perfil")}
          </Link>
        </div>
      </div>
    );
  }

  const { data: campos } = await supabase
    .from("campos")
    .select("*, fotos:campos_fotos(url, orden)")
    .eq("propietario_id", user.id)
    .order("created_at", { ascending: false });


  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">{tt("Mis campos", "Minhas terras")}</h1>
          <p className="page-subtitle">
            {campos?.length
              ? country==="BR"?`${campos.length} terra${campos.length!==1?"s":""} anunciada${campos.length!==1?"s":""}`:`${campos.length} campo${campos.length !== 1 ? "s" : ""} publicado${campos.length !== 1 ? "s" : ""}`
               : tt("Todavía no publicaste ningún campo","Você ainda não anunciou terras")}
          </p>
        </div>
        <Link href="/mis-campos/nuevo" className="btn-primary-lg">
          + {tt("Publicar campo","Anunciar terra")}
        </Link>
      </div>

      <p className="page-subtitle" role="status">
        {tt("Publicar campos y servicios es 100% gratis. Sin packs ni límites de publicaciones.",
            "Anunciar terras e serviços é 100% grátis. Sem pacotes nem limites de anúncios.")}
      </p>
      <MisCamposLista campos={campos ?? []} />
    </div>
  );
}
