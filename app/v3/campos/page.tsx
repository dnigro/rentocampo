import type { Metadata } from "next";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { COUNTRIES, resolveCountry } from "@/data/countries";
import { normalizarCoordenada, seleccionarCamposPublicos } from "@/lib/campos/visible-fields";
import { parseMapBounds } from "@/lib/campos/map-search";
import V3Explorer, { type V3Campo } from "../components/V3Explorer";
import "leaflet/dist/leaflet.css";

export const metadata: Metadata = {
  title: "Explorar campos | RentoCampo V3",
  description: "Explorá campos rurales, compará publicaciones y mirá sus ubicaciones en un mismo mapa.",
  robots: { index: false, follow: false }
};

type Filters = { pais?: string; operacion?: string; provincia?: string; aptitud?: string; hectareas_min?: string; hectareas_max?: string; precio_min?: string; precio_max?: string; moneda?: string; north?: string; south?: string; east?: string; west?: string };

export default async function V3Campos({ searchParams }: { searchParams: Promise<Filters> }) {
  const params = await searchParams;
  const storedCountry = (await cookies()).get("rentocampo_country")?.value;
  const country = resolveCountry(params.pais, storedCountry);
  const supabase = await createClient();

  let query = supabase
    .from("campos")
    .select("*, fotos:campos_fotos(id, url, orden, storage_path)")
    .eq("status", "activo")
    .eq("country_code", country)
    .order("created_at", { ascending: false })
    .limit(120);

  if (["venta", "alquiler", "ambas"].includes(params.operacion || "")) query = query.eq("operacion", params.operacion!);
  if (params.provincia?.trim()) query = query.eq("provincia", params.provincia.trim());
  if (["agricola", "ganadera", "mixta", "forestal"].includes(params.aptitud || "")) query = query.eq("aptitud", params.aptitud!);
  const minimum = Number(params.hectareas_min);
  if (Number.isFinite(minimum) && minimum > 0) query = query.gte("hectareas", minimum);

  const maximum = Number(params.hectareas_max);
  if (params.hectareas_max && Number.isFinite(maximum) && maximum >= 0) query = query.lte("hectareas", maximum);
  const validCurrency = [COUNTRIES[country].currency, "USD"].includes(params.moneda || "");
  if (validCurrency) {
    query = query.eq("moneda", params.moneda!);
    for (const [param, method] of [["precio_min", "gte"], ["precio_max", "lte"]] as const) {
      const value = Number(params[param]);
      if (params[param] && Number.isFinite(value) && value >= 0) query = query[method]("precio", value);
    }
  }
  const priceNeedsCurrency = Boolean((params.precio_min || params.precio_max) && !validCurrency);
  const { data, error } = await query;
  const visible = seleccionarCamposPublicos(data || []).filter(campo =>
    !String(campo.id).startsWith("20000000-") && !String(campo.titulo || "").toUpperCase().includes("DEMO")
  );
  const campos: V3Campo[] = visible.map(campo => {
    const fotos = [...(campo.fotos || [])].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
    const lat = normalizarCoordenada(campo.latitud);
    const lng = normalizarCoordenada(campo.longitud);
    return {
      id: campo.id, titulo: campo.titulo || "Campo disponible",
      localidad: campo.localidad || null, provincia: campo.provincia || null,
      hectareas: campo.hectareas == null ? null : Number(campo.hectareas),
      aptitud: campo.aptitud || null, operacion: campo.operacion || null,
      precio: campo.precio == null ? null : Number(campo.precio),
      moneda: campo.moneda || null,
      foto: fotos[0]?.url || null,
      fotos: fotos.filter(foto => Boolean(foto.url)).slice(0, 8).map(foto => foto.url),
      lat: lat != null && lat >= -90 && lat <= 90 ? lat : null,
      lng: lng != null && lng >= -180 && lng <= 180 ? lng : null
    };
  });

  return <div className="v3-catalog v3-catalog-map">
    <div className="v3-catalog-heading">
      <div><span className="v3-kicker">EXPLORADOR RURAL</span>
        <h1>Todo el campo, en un lugar.</h1>
        <p>Descubrí oportunidades en {COUNTRIES[country].name}. Fichas y mapa juntos, sin intermediarios.</p>
      </div>
    </div>
    {priceNeedsCurrency && <p role="alert" className="v3-price-filter-notice">Elegí una moneda en Más filtros para aplicar el rango de precio.</p>}
    <V3Explorer key={JSON.stringify(params)} campos={campos} country={country} filter={params} error={Boolean(error)} initialBounds={parseMapBounds(params)} truncated={data?.length === 120}/>
    <p className="v3-uat-disclaimer">V3 Preview de solo lectura. Favoritos temporales para UAT; los mensajes y las publicaciones no se modifican.</p>
  </div>;
}
