import type { CountryCode } from "@/data/countries";

/**
 * Editorial regional references, NOT measured commercial demand.
 * Do not display as buyer intent, verified requests, or price signals.
 */
export interface RegionProductiva {
  zona: string;
  subdivision: string;
  actividad: string;
}

export const REGIONES_PRODUCTIVAS: Record<CountryCode, readonly RegionProductiva[]> = {
  AR: [
    { zona: "Pergamino", subdivision: "Buenos Aires", actividad: "Agricultura" },
    { zona: "Río Cuarto", subdivision: "Córdoba", actividad: "Agricultura y ganadería" },
    { zona: "Venado Tuerto", subdivision: "Santa Fe", actividad: "Cultivos y producción mixta" },
    { zona: "General Pico", subdivision: "La Pampa", actividad: "Ganadería y agricultura" },
  ],
  UY: [
    { zona: "Colonia Valdense", subdivision: "Colonia", actividad: "Lechería y agricultura" },
    { zona: "Durazno", subdivision: "Durazno", actividad: "Ganadería y pasturas" },
    { zona: "Paysandú", subdivision: "Paysandú", actividad: "Agricultura y ganadería" },
    { zona: "Tacuarembó", subdivision: "Tacuarembó", actividad: "Ganadería y forestación" },
  ],
  PY: [
    { zona: "Encarnación", subdivision: "Itapúa", actividad: "Agricultura y producción mixta" },
    { zona: "Ciudad del Este", subdivision: "Alto Paraná", actividad: "Cultivos y agroindustria" },
    { zona: "Caaguazú", subdivision: "Caaguazú", actividad: "Producción agrícola" },
    { zona: "Salto del Guairá", subdivision: "Canindeyú", actividad: "Cultivos y ganadería" },
  ],
  CL: [
    { zona: "Chillán", subdivision: "Ñuble", actividad: "Cultivos y fruticultura" },
    { zona: "Talca", subdivision: "Maule", actividad: "Fruticultura y viñedos" },
    { zona: "Temuco", subdivision: "La Araucanía", actividad: "Agricultura y ganadería" },
    { zona: "Osorno", subdivision: "Los Lagos", actividad: "Lechería y ganadería" },
  ],
  BO: [
    { zona: "Santa Cruz de la Sierra", subdivision: "Santa Cruz", actividad: "Agricultura y ganadería" },
    { zona: "Montero", subdivision: "Santa Cruz", actividad: "Agroindustria y cultivos" },
    { zona: "Cochabamba", subdivision: "Cochabamba", actividad: "Producción de valles" },
    { zona: "Trinidad", subdivision: "Beni", actividad: "Ganadería de llanura" },
  ],
  PE: [
    { zona: "Trujillo", subdivision: "La Libertad", actividad: "Agroexportación y cultivos" },
    { zona: "Huancayo", subdivision: "Junín", actividad: "Agricultura andina" },
    { zona: "Piura", subdivision: "Piura", actividad: "Agricultura bajo riego" },
    { zona: "Pucallpa", subdivision: "Ucayali", actividad: "Producción amazónica" },
  ],
  BR: [
    { zona: "Ribeirão Preto", subdivision: "São Paulo", actividad: "Cana-de-açúcar e grãos" },
    { zona: "Rondonópolis", subdivision: "Mato Grosso", actividad: "Grãos e pecuária" },
    { zona: "Londrina", subdivision: "Paraná", actividad: "Soja e milho" },
    { zona: "Passo Fundo", subdivision: "Rio Grande do Sul", actividad: "Grãos e pecuária" },
  ],
};

export const REGIONES_EDITORIALES_ES: Record<Exclude<CountryCode, "BR">, string> = {
  AR: "De la zona núcleo a las tierras ganaderas del interior.",
  UY: "Del litoral agrícola a los campos ganaderos y lecheros.",
  PY: "Regiones agrícolas y ganaderas con identidad propia.",
  CL: "De los valles centrales al sur productivo.",
  BO: "Valles, llanos y territorios de producción rural.",
  PE: "Costa, sierra y selva: distintas formas de producir.",
};
