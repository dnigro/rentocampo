export type PlanTierraId =
  | "inicial"
  | "productiva"
  | "administrador"
  | "portfolio";

export interface PlanTierra {
  id: PlanTierraId;
  nombre: string;
  bajada: string;
  perfilIdeal: string;
  publicaciones: number | null;
  precioUsdAnual: number;
  recomendado?: boolean;
  publicoObjetivo: string;
}

export const PLANES_TIERRA: PlanTierra[] = [
  {
    id: "inicial",
    nombre: "Tierra Inicial",
    bajada: "Para probar RentoCampo y publicar tu primera oportunidad.",
    perfilIdeal: "Ideal para propietarios que publican su primera tierra.",
    publicaciones: 1,
    precioUsdAnual: 0,
    publicoObjetivo: "Propietarios con una sola tierra para publicar",
  },
  {
    id: "productiva",
    nombre: "Tierra Productiva",
    bajada: "Hasta 10 oportunidades de publicación durante 12 meses.",
    perfilIdeal: "Para propietarios con varias oportunidades durante el año.",
    publicaciones: 10,
    precioUsdAnual: 100,
    recomendado: true,
    publicoObjetivo: "Propietarios y administradores pequeños",
  },
  {
    id: "administrador",
    nombre: "Administrador de Tierras",
    bajada: "Hasta 20 oportunidades de publicación durante 12 meses.",
    perfilIdeal: "Para administradores, estudios o carteras medianas de tierras.",
    publicaciones: 20,
    precioUsdAnual: 200,
    publicoObjetivo: "Administradores con cartera de tierras",
  },
  {
    id: "portfolio",
    nombre: "RentoCampo Portfolio",
    bajada: "Publicaciones ilimitadas durante 12 meses.",
    perfilIdeal: "Para inmobiliarias rurales y grandes portfolios de tierras.",
    publicaciones: null,
    precioUsdAnual: 399,
    publicoObjetivo: "Inmobiliarias rurales y grandes administradores",
  },
];

export function publicacionesLabel(plan: PlanTierra) {
  return plan.publicaciones === null
    ? "Publicaciones ilimitadas"
    : `Hasta ${plan.publicaciones} publicación${plan.publicaciones === 1 ? "" : "es"}`;
}
