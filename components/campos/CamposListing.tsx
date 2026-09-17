import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import CampoCard from "@/components/campos/CampoCard";
import CampoFiltros from "@/components/campos/CampoFiltros";
import DemandaZonasPanel from "@/components/campos/DemandaZonasPanel";

export interface CamposSearchParams {
  [key: string]: string | undefined;
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
}

const PAGE_SIZE = 12;

export default async function CamposListing({ params, titulo, descripcion }: Props) {
  const page = Math.max(1, Number(params.page ?? 1) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const supabase = await createClient();

  let query = supabase
    .from("campos")
    .select("*, fotos:campos_fotos(id, url, orden, storage_path)", { count: "exact" })
    .eq("status", "activo")
    .order("created_at", { ascending: false })
    .range(from, to);

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

  const [{ data: campos, count }, { data: { user } }] = await Promise.all([
    query,
    supabase.auth.getUser(),
  ]);

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);
  const hayFiltros = Object.keys(params).some(
    (key) => key !== "page" && params[key],
  );

  return (
    <div className="explorador-layout">
      <aside className="explorador-sidebar">
        <CampoFiltros filtrosActivos={params} />
      </aside>

      <main className="explorador-main">
        <div className="explorador-contenido">
          <section className="explorador-resultados">
            <div className="explorador-header">
              <div>
                <h1 className="explorador-title">
                  {titulo ?? (hayFiltros ? "Resultados" : "Campos disponibles")}
                </h1>
                {descripcion && <p className="seo-listing-description">{descripcion}</p>}
                <p className="explorador-count">
                  {count ?? 0} campo{count !== 1 ? "s" : ""} encontrado
                  {count !== 1 ? "s" : ""}
                </p>
              </div>
              <Link href="/campos/mapa" className="btn-mapa">🗺️ Ver en mapa</Link>
            </div>

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
                        className="btn-pagina"
                      >
                        ← Anterior
                      </Link>
                    )}
                    <span className="pagina-info">Página {page} de {totalPages}</span>
                    {page < totalPages && (
                      <Link
                        href={`?${new URLSearchParams({ ...params, page: String(page + 1) })}`}
                        className="btn-pagina"
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
                <Link href="/campos" className="btn-primary-lg">Ver todos los campos</Link>
              </div>
            )}
          </section>

          <DemandaZonasPanel provincia={params.provincia} />
        </div>

        <section className="demanda-cta">
          <div>
            <p className="demanda-cta-kicker">Publicar es gratis</p>
            <h2>¿Tenés un campo en alguna de estas zonas?</h2>
            <p>Hay productores interesados. Hacelo visible y empezá a recibir consultas directas.</p>
          </div>
          <Link href="/register?tipo=propietario" className="demanda-cta-boton">
            Publicar mi campo gratis →
          </Link>
        </section>

        <nav className="seo-explore" aria-label="Explorar alquileres rurales">
          <p className="seo-explore-title">Explorá campos por zona y aptitud</p>
          <div className="seo-explore-links">
            <Link href="/alquiler-de-campos/buenos-aires">Buenos Aires</Link>
            <Link href="/alquiler-de-campos/santa-fe">Santa Fe</Link>
            <Link href="/alquiler-de-campos/cordoba">Córdoba</Link>
            <Link href="/alquiler-de-campos/agricolas">Agrícolas</Link>
            <Link href="/alquiler-de-campos/ganaderos">Ganaderos</Link>
            <Link href="/alquiler-de-campos/mixtos">Mixtos</Link>
          </div>
        </nav>
      </main>
    </div>
  );
}
