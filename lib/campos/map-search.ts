export type MapBounds = { north: number; south: number; east: number; west: number };

type Located = { lat: number | null; lng: number | null };
export function isWithinBounds(location: Located, bounds: MapBounds): boolean {
  const { lat, lng } = location;
  if (lat == null || lng == null || !Number.isFinite(lat) || !Number.isFinite(lng)) return false;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return false;
  if (lat < bounds.south || lat > bounds.north) return false;
  // Leaflet can return longitudes outside [-180,180] when the world is wrapped.
  if (bounds.east - bounds.west >= 360) return true;
  const west = ((bounds.west + 180) % 360 + 360) % 360 - 180;
  const east = ((bounds.east + 180) % 360 + 360) % 360 - 180;
  return west <= east ? lng >= west && lng <= east : lng >= west || lng <= east;
}

export function markerLabel(campo: { precio: number | null; moneda: string | null; hectareas: number | null }, locale: string) {
  if (campo.precio != null && Number.isFinite(campo.precio) && campo.precio >= 0 && campo.moneda) {
    return `${campo.moneda} ${campo.precio.toLocaleString(locale, { maximumFractionDigits: 0 })}`;
  }
  if (campo.hectareas != null && Number.isFinite(campo.hectareas) && campo.hectareas > 0) {
    return `${campo.hectareas.toLocaleString(locale)} ha`;
  }
  return "Ver campo";
}

export function parseMapBounds(params: Record<string, string | undefined>): MapBounds | null {
  const keys = ["north", "south", "east", "west"] as const;
  if (keys.some(key => typeof params[key] !== "string" || !params[key]?.trim())) return null;
  const [north, south, east, west] = keys.map(key => Number(params[key]));
  if (![north, south, east, west].every(Number.isFinite) || north > 90 || south < -90 || north < south || Math.abs(east) > 540 || Math.abs(west) > 540) return null;
  return { north, south, east, west };
}

export function addMapBounds(search: URLSearchParams, bounds: MapBounds | null) {
  if (bounds) for (const key of ["north", "south", "east", "west"] as const) search.set(key, bounds[key].toFixed(6));
  return search;
}
