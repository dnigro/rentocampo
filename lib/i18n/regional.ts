import type { CountryCode } from "@/data/countries";

export function regionalText(country: CountryCode, spanish: string, portuguese: string): string {
  return country === "BR" ? portuguese : spanish;
}
