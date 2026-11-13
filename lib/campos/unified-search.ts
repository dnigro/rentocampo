/** Keep only public search state when returning from a listing to the shared explorer. */
export function unifiedExplorerHref(filters: Record<string, string | undefined>, country: string) {
 const query = new URLSearchParams({ pais: country });
 for (const key of ["tipo", "vista", "provincia", "operacion", "aptitud", "servicio", "north", "south", "east", "west"]) {
  const value = filters[key];
  if (typeof value === "string" && value) query.set(key, value);
 }
 return `/v3?${query}#explorar`;
}
