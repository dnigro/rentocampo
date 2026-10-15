export type CountryCode = "AR" | "UY" | "PY";

export const COUNTRIES = {
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
};

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
