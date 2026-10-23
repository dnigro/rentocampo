import { EXPANSION_COUNTRIES, EXPANSION_COUNTRY_CODES, EXPANSION_SUBDIVISIONS } from "./latam-expansion.ts";
export const COUNTRY_CODES = ["AR", "UY", "PY", "CL", "BO", "PE", "BR", ...EXPANSION_COUNTRY_CODES] as const;
export type CountryCode = (typeof COUNTRY_CODES)[number];

export const COUNTRIES = {
  BR: {
    code: "BR" as const,
    name: "Brasil", flag: "🇧🇷", locale: "pt-BR", currency: "BRL",
    subdivisionLabel: "Estado", mapCenter: [-14.2, -51.9] as [number, number], mapZoom: 4,
  },
  AR: {
    code: "AR" as const,
    name: "Argentina",
    flag: "🇦🇷",
    locale: "es-AR",
    currency: "ARS",
    subdivisionLabel: "Provincia",
    mapCenter: [-34, -63.5] as [number, number],
    mapZoom: 4.5,
  },
  PY: {
    code: "PY" as const,
    name: "Paraguay",
    flag: "🇵🇾",
    locale: "es-PY",
    currency: "PYG",
    subdivisionLabel: "Departamento",
    mapCenter: [-23.7, -58.3] as [number, number],
    mapZoom: 6,
  },
  CL: {
    code: "CL" as const,
    name: "Chile", flag: "🇨🇱", locale: "es-CL", currency: "CLP",
    subdivisionLabel: "Región", mapCenter: [-35.7, -71.5] as [number, number], mapZoom: 4.8,
  },
  BO: {
    code: "BO" as const,
    name: "Bolivia", flag: "🇧🇴", locale: "es-BO", currency: "BOB",
    subdivisionLabel: "Departamento", mapCenter: [-16.7, -64.7] as [number, number], mapZoom: 5.7,
  },
  PE: {
    code: "PE" as const,
    name: "Perú", flag: "🇵🇪", locale: "es-PE", currency: "PEN",
    subdivisionLabel: "Departamento", mapCenter: [-9.4, -75.2] as [number, number], mapZoom: 5.4,
  },
  UY: {
    code: "UY" as const,
    name: "Uruguay",
    flag: "🇺🇾",
    locale: "es-UY",
    currency: "UYU",
    subdivisionLabel: "Departamento",
    mapCenter: [-32.8, -56.0] as [number, number],
    mapZoom: 6.2,
  },
  ...EXPANSION_COUNTRIES,
};

/** Presentation order; canonical COUNTRY_CODES retains its stable identifiers. */
export const COUNTRY_CODES_ALPHABETICAL: readonly CountryCode[] = [...COUNTRY_CODES].sort(
  (a, b) => COUNTRIES[a].name.localeCompare(COUNTRIES[b].name, "es", { sensitivity: "base" }),
);

export const DEPARTAMENTOS_UY = [
  "Artigas",
  "Canelones",
  "Cerro Largo",
  "Colonia",
  "Durazno",
  "Flores",
  "Florida",
  "Lavalleja",
  "Maldonado",
  "Montevideo",
  "Paysandú",
  "Río Negro",
  "Rivera",
  "Rocha",
  "Salto",
  "San José",
  "Soriano",
  "Tacuarembó",
  "Treinta y Tres",
] as const;

export const DEPARTAMENTOS_PY = [
  "Alto Paraguay", "Alto Paraná", "Amambay", "Asunción", "Boquerón", "Caaguazú", "Caazapá", "Canindeyú", "Central", "Concepción", "Cordillera", "Guairá", "Itapúa", "Misiones", "Ñeembucú", "Paraguarí", "Presidente Hayes", "San Pedro",
] as const;

export const REGIONES_CL = ["Arica y Parinacota", "Tarapacá", "Antofagasta", "Atacama", "Coquimbo", "Valparaíso", "Metropolitana de Santiago", "O'Higgins", "Maule", "Ñuble", "Biobío", "La Araucanía", "Los Ríos", "Los Lagos", "Aysén", "Magallanes"] as const;
export const DEPARTAMENTOS_BO = ["Beni", "Chuquisaca", "Cochabamba", "La Paz", "Oruro", "Pando", "Potosí", "Santa Cruz", "Tarija"] as const;
export const DEPARTAMENTOS_PE = ["Amazonas", "Áncash", "Apurímac", "Arequipa", "Ayacucho", "Cajamarca", "Callao", "Cusco", "Huancavelica", "Huánuco", "Ica", "Junín", "La Libertad", "Lambayeque", "Lima", "Loreto", "Madre de Dios", "Moquegua", "Pasco", "Piura", "Puno", "San Martín", "Tacna", "Tumbes", "Ucayali"] as const;

export const ESTADOS_BR = [
  "Acre", "Alagoas", "Amapá", "Amazonas", "Bahia", "Ceará", "Distrito Federal",
  "Espírito Santo", "Goiás", "Maranhão", "Mato Grosso", "Mato Grosso do Sul",
  "Minas Gerais", "Pará", "Paraíba", "Paraná", "Pernambuco", "Piauí",
  "Rio de Janeiro", "Rio Grande do Norte", "Rio Grande do Sul", "Rondônia",
  "Roraima", "Santa Catarina", "São Paulo", "Sergipe", "Tocantins",
] as const;

export function getCountrySubdivisions(code: CountryCode): readonly string[] {
  if (code in EXPANSION_SUBDIVISIONS) return EXPANSION_SUBDIVISIONS[code as keyof typeof EXPANSION_SUBDIVISIONS];
  switch (code) {
    case "BR": return ESTADOS_BR;
    case "UY": return DEPARTAMENTOS_UY;
    case "PY": return DEPARTAMENTOS_PY;
    case "CL": return REGIONES_CL;
    case "BO": return DEPARTAMENTOS_BO;
    case "PE": return DEPARTAMENTOS_PE;
    default: return ["Buenos Aires", "CABA", "Catamarca", "Chaco", "Chubut", "Córdoba", "Corrientes", "Entre Ríos", "Formosa", "Jujuy", "La Pampa", "La Rioja", "Mendoza", "Misiones", "Neuquén", "Río Negro", "Salta", "San Juan", "San Luis", "Santa Cruz", "Santa Fe", "Santiago del Estero", "Tierra del Fuego", "Tucumán"];
  }
}
export function isCountryCode(value: unknown): value is CountryCode {
  return typeof value === "string" && (COUNTRY_CODES as readonly string[]).includes(value);
}

export function resolveCountry(value?: string | null, saved?: string | null): CountryCode {
  return isCountryCode(value) ? value : isCountryCode(saved) ? saved : "AR";
}
