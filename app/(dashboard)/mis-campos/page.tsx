import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import MisCamposLista from "@/components/campos/MisCamposLista";
import PlanesTierra from "@/components/planes/PlanesTierra";
import { getLandQuotaStatus } from "@/lib/billing/land-quota";
import "@/styles/perfil.css";
import "@/styles/campos.css";

export default async function MisCamposPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("roles")
    .eq("id", user.id)
    .single();

  const esPropietario = profile?.roles?.includes("propietario");

  if (!esPropietario) {
    return (
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Mis campos</h1>
            <p className="page-subtitle">Publicá y administrá tus campos desde acá.</p>
          </div>
        </div>

        <div className="role-gate-card">
          <div className="role-gate-icon">🌾</div>
          <h2>Para publicar campos tenés que cambiar tu rol a Propietario</h2>
          <p>
            Podés hacerlo desde Mi perfil. Activá el rol Propietario y después
            volvé a Mis campos para comenzar a publicar.
          </p>
          <Link href="/perfil?activar=propietario" className="btn-primary-lg">
            Cambiar mi rol en el perfil
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

  const publicacionesReales = (campos ?? []).filter(
    (campo) => !campo.id.startsWith("20000000-"),
  ).length;
  const quota = await getLandQuotaStatus(user.id);

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

      <PlanesTierra
        planActualId={quota.planId}
        planActualNombre={quota.planName}
        publicacionesUsadas={quota.used}
        publicacionesReales={publicacionesReales}
        publicacionesLimite={quota.limit}
        publicacionesRestantes={quota.remaining}
      />
      <MisCamposLista campos={campos ?? []} />
    </div>
  );
}
