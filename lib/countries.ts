export type CountryCode = "AR" | "UY";

export interface CountryConfig {
  code: CountryCode;
  slug: "" | "uy";
  name: string;
  flag: string;
  locale: "es-AR" | "es-UY";
  currency: "ARS" | "UYU";
  currencySymbol: "$";
  subdivisionLabel: "Provincia" | "Departamento";
  marketLabel: string;
  heroEyebrow: string;
  heroTitle: string;
  heroDescription: string;
  serviceLine: string;
}

export const COUNTRIES: Record<CountryCode, CountryConfig> = {
  AR: {
    code: "AR",
    slug: "",
    name: "Argentina",
    flag: "🇦🇷",
    locale: "es-AR",
    currency: "ARS",
    currencySymbol: "$",
    subdivisionLabel: "Provincia",
    marketLabel: "Argentina",
    heroEyebrow: "Marketplace rural · Argentina",
    heroTitle: "Tu campo tiene potencial. Hacelo visible.",
    heroDescription:
      "Tierra productiva, productores y servicios rurales conectados en una red federal.",
    serviceLine: "Mapa + chat online + publicación gratuita.",
  },
  UY: {
    code: "UY",
    slug: "uy",
    name: "Uruguay",
    flag: "🇺🇾",
    locale: "es-UY",
    currency: "UYU",
    currencySymbol: "$",
    subdivisionLabel: "Departamento",
    marketLabel: "Uruguay",
    heroEyebrow: "Marketplace rural · Uruguay",
    heroTitle: "La tierra productiva se conecta.",
    heroDescription:
      "Campos, productores y servicios rurales de Uruguay en una misma plataforma.",
    serviceLine: "Publicá, explorá el mapa y conectate directamente.",
  },
};

export function countryPath(code: CountryCode, path = "") {
  const country = COUNTRIES[code];
  const prefix = country.slug ? `/${country.slug}` : "";
  if (!path) return prefix || "/";
  return `${prefix}${path.startsWith("/") ? path : `/${path}`}`;
}
