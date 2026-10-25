import type { CountryCode } from "./countries.ts";
import { regionalPublicationHref } from "../lib/publicacion-regional.ts";
import { EXPANSION_COUNTRY_CODES } from "./latam-expansion.ts";

/** Allow only approved, clearly labelled DEMO fixtures, never an arbitrary fake service. */
export const DEMO_SERVICIO_VISIBLE_IDS = new Set<string>([
  ...[5, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19].map(n => `10000000-0000-4000-8000-${String(n).padStart(12, "0")}`),
  ...EXPANSION_COUNTRY_CODES.map((_, index) => `10000000-0000-4000-8000-${String(101 + index).padStart(12, "0")}`),
  // Verified UAT seed IDs for US launch; do not expose arbitrary service DEMOs.
  "10000000-0000-4000-8000-000000000301",
  "10000000-0000-4000-8000-000000000302",
]);

export function esServicioDemoVisible(id: string): boolean {
  return DEMO_SERVICIO_VISIBLE_IDS.has(id);
}

/** All DEMO service CTAs are acquisition examples, never contactable offers. */
export function demoServiceRegisterHref(country: CountryCode, authenticated = false): string {
  return regionalPublicationHref({ country, kind: "servicio", authenticated });
}
