import type { CountryCode } from "@/data/countries";
import { regionalPublicationDestination } from "@/lib/publicacion-regional";

export function isDemoField(id: string, title?: string | null) {
  return id.startsWith("20000000-") || /\bDEMO\b/i.test(title || "");
}
export function demoListingHref(country: CountryCode, kind: "campo" | "servicio", zone?: string | null) {
  return regionalPublicationDestination({country, kind, zona: zone || undefined});
}
