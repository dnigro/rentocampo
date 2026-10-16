import { resolveCountry } from "@/data/countries";
import { campoFilterParams } from "@/lib/campos/filter-params";
import Link from "next/link";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import ListingHeader from "@/components/listings/ListingHeader";
import ListingCountrySelector from "@/components/listings/ListingCountrySelector";
import CampoCard from "@/components/campos/CampoCard";
import CampoFiltros from "@/components/campos/CampoFiltros";
import DemandaZonasPanel from "@/components/campos/DemandaZonasPanel";
import { seleccionarCamposPublicos } from "@/lib/campos/visible-fields";

export interface CamposSearchParams {
  [key: string]: string | undefined;
  pais?: string;
  operacion?: string;
  provincia?: string;
  aptitud?: string;
  hectareas_min?: string;
  hectareas_max?: string;
  precio_min?: string;
  precio_max?: string;
  disponibilidad?: string;
  page?: string;
}

interface Props {
  params: CamposSearchParams;
  titulo?: string;
  descripcion?: string;
  soloAlquiler?: boolean;
}

const PAGE_SIZE = 12;

export default async function CamposListing({ params, titulo, descripcion, soloAlquiler = false }: Props) {
  const page = Math.max(1, Number(params.page ?? 1) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE;
  const supabase = await createClient();

  const saved = (await cookies()).get("rentocampo_country")?.value;
  const pais = resolveCountry(params.pais, saved);
  const mapParams = campoFilterParams({ ...params, pais, ...(soloAlquiler ? { operacion: "alquiler_o_ambas" } : {}) });
  let query = supabase
    .from("campos")
    .select("*, fotos:campos_fotos(id, url, orden, storage_path)")
    .eq("status", "activo")
    .eq("country_code", pais)
    .order("created_at", { ascending: false });

  // En landings de alquiler, no presentar avisos declarados solo para venta.
  if (soloAlquiler) query = query.in("operacion", ["alquiler", "ambas"]);
  else if (["alquiler", "venta", "ambas"].includes(params.operacion ?? "")) query = query.eq("operacion", params.operacion!);
  if (params.provincia) query = query.eq("provincia", params.provincia);
  if (params.aptitud) query = query.eq("aptitud", params.aptitud);
  if (params.hectareas_min) query = query.gte("hectareas", Number(params.hectareas_min));
  if (params.hectareas_max) query = query.lte("hectareas", Number(params.hectareas_max));
  if (params.precio_min) query = query.gte("precio", Number(params.precio_min));
  if (params.precio_max) query = query.lte("precio", Number(params.precio_max));
  if (params.disponibilidad === "inmediata") {
    query = query.or(
      `disponibilidad_desde.is.null,disponibilidad_desde.lte.${new Date().toISOString().slice(0, 10)}`,
    );
  }
  if (params.disponibilidad === "campaña_próxima") {
    query = query.gt("disponibilidad_desde", new Date().toISOString().slice(0, 10));
  }

  const [{ data: camposRaw }, { data: { user } }] = await Promise.all([
    query,
    supabase.auth.getUser(),
  ]);

  const camposVisibles = seleccionarCamposPublicos(camposRaw ?? []);
  const count = camposVisibles.length;
  const campos = camposVisibles.slice(from, to);
  const totalPages = Math.ceil(count / PAGE_SIZE);
  const hayFiltros = Object.keys(params).some(
    (key) => key !== "page" && params[key],
  );

  return (
    <div className="explorador-layout explorador-layout-results-first">
      <ListingHeader
        title={titulo ?? (hayFiltros ? "Resultados" : "Campos disponibles")}
        description={descripcion}
        count={`${count} campo${count !== 1 ? "s" : ""} encontrado${count !== 1 ? "s" : ""}`}
      />

      <ListingCountrySelector country={pais} />

      <nav className="explorador-switch" aria-label="Explorar otras publicaciones">
        <Link href={`/servicios-rurales?pais=${pais}`}>Ver servicios rurales →</Link>
      </nav>

      <Link href={`/campos/mapa?${mapParams}`} className="listing-button rc-map-before-listings">Ver en mapa →</Link>

      <main className="explorador-main">
        <div className="explorador-contenido">
          <section className="explorador-resultados">
            {campos && campos.length > 0 ? (
              <>
                <div className="campos-explorador-grid">
                  {campos.map((campo) => (
                    <CampoCard key={campo.id} campo={campo} userId={user?.id} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="paginacion">
                    {page > 1 && (
                      <Link
                        href={`?${new URLSearchParams({ ...params, page: String(page - 1) })}`}
                        className="listing-button"
                      >
                        ← Anterior
                      </Link>
                    )}
                    <span className="pagina-info">Página {page} de {totalPages}</span>
                    {page < totalPages && (
                      <Link
                        href={`?${new URLSearchParams({ ...params, page: String(page + 1) })}`}
                        className="listing-button"
                      >
                        Siguiente →
                      </Link>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="empty-state">
                <span className="empty-icon">🔍</span>
                <p className="empty-title">Todavía no hay campos publicados en esta categoría</p>
                <p className="empty-desc">Podés explorar el mapa o publicar un campo gratuitamente.</p>
                <Link href={`/campos?pais=${pais}`} className="listing-button">Ver todos los campos</Link>
              </div>
            )}
            <aside className="explorador-sidebar explorador-sidebar-bottom" aria-label="Filtrar campos">
              <CampoFiltros filtrosActivos={{ ...params, pais }} />
            </aside>
          </section>

          {pais === "AR" && <DemandaZonasPanel provincia={params.provincia} />}
        </div>

        <section className="demanda-cta">
          <div>
            <p className="demanda-cta-kicker">Publicar es gratis</p>
            <h2>¿Tenés un campo en alguna de estas zonas?</h2>
            <p>Hay productores interesados. Hacelo visible y empezá a recibir consultas directas.</p>
          </div>
          <Link href={`/register?tipo=propietario&pais=${pais}`} className="demanda-cta-boton">
            Publicar mi campo gratis →
          </Link>
        </section>

        {pais === "AR" && <nav className="seo-explore" aria-label="Explorar alquileres rurales">
          <p className="seo-explore-title">Explorá campos por zona y aptitud</p>
          <div className="seo-explore-links">
            <Link href="/alquiler-de-campos/buenos-aires">Buenos Aires</Link>
            <Link href="/alquiler-de-campos/santa-fe">Santa Fe</Link>
            <Link href="/alquiler-de-campos/cordoba">Córdoba</Link>
            <Link href="/alquiler-de-campos/agricolas">Agrícolas</Link>
            <Link href="/alquiler-de-campos/ganaderos">Ganaderos</Link>
            <Link href="/alquiler-de-campos/mixtos">Mixtos</Link>
          </div>
        </nav>}
      </main>
    </div>
  );
}
