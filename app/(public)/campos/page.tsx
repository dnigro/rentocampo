import { createClient } from "@/lib/supabase/server";
import CampoCard from "@/components/campos/CampoCard";
import CampoFiltros from "@/components/campos/CampoFiltros";
import Link from "next/link";
import "@/styles/campos.css";
import "@/styles/explorador.css";

interface SearchParams {
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

const PAGE_SIZE = 12;

export default async function CamposPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = Number(params.page ?? 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();

  let query = supabase
    .from("campos")
    .select("*, fotos:campos_fotos(url, orden)", { count: "exact" })
    .eq("estado", "activo")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (params.provincia) query = query.eq("provincia", params.provincia);
  if (params.aptitud) query = query.eq("aptitud", params.aptitud);
  if (params.hectareas_min)
    query = query.gte("hectareas", Number(params.hectareas_min));
  if (params.hectareas_max)
    query = query.lte("hectareas", Number(params.hectareas_max));
  if (params.precio_min)
    query = query.gte("precio_ha", Number(params.precio_min));
  if (params.precio_max)
    query = query.lte("precio_ha", Number(params.precio_max));
  if (params.disponibilidad)
    query = query.eq("disponibilidad", params.disponibilidad);

  const { data: campos, count } = await query;

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);
  const hayFiltros = Object.keys(params).some(
    (k) => k !== "page" && params[k as keyof SearchParams],
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="explorador-layout">
      <aside className="explorador-sidebar">
        <CampoFiltros filtrosActivos={params} />
      </aside>

      <main className="explorador-main">
        <div className="explorador-header">
          <div>
            <h1 className="explorador-title">
              {hayFiltros ? "Resultados" : "Campos disponibles"}
            </h1>
            <p className="explorador-count">
              {count ?? 0} campo{count !== 1 ? "s" : ""} encontrado
              {count !== 1 ? "s" : ""}
            </p>
          </div>
          <Link href="/campos/mapa" className="btn-mapa">
            🗺️ Ver en mapa
          </Link>
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
                    href={`/campos?${new URLSearchParams({ ...params, page: String(page - 1) })}`}
                    className="btn-pagina"
                  >
                    ← Anterior
                  </Link>
                )}
                <span className="pagina-info">
                  Página {page} de {totalPages}
                </span>
                {page < totalPages && (
                  <Link
                    href={`/campos?${new URLSearchParams({ ...params, page: String(page + 1) })}`}
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
            <p className="empty-title">No hay campos con esos filtros</p>
            <p className="empty-desc">
              Probá ajustando los filtros o buscando en otra provincia.
            </p>
            <Link href="/campos" className="btn-primary-lg">
              Ver todos los campos
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
