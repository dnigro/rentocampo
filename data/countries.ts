export type CountryCode = "AR" | "UY";

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
