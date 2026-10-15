const FIELD_FILTERS = ["pais", "provincia", "operacion", "aptitud", "hectareas_min", "hectareas_max", "precio_min", "precio_max", "disponibilidad"] as const;

export function campoFilterParams(params: Record<string, string | undefined>) {
  const search = new URLSearchParams();
  for (const key of FIELD_FILTERS) if (params[key]) search.set(key, params[key]);
  return search;
}
