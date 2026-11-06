import type { ServicioRural } from "@/types";

export const SERVICIOS_RURALES: Array<{ value: ServicioRural; label: string }> = [
  { value: "cosecha", label: "Cosecha" },
  { value: "siembra", label: "Siembra" },
  { value: "pulverizacion", label: "Pulverización" },
  { value: "fertilizacion", label: "Fertilización" },
  { value: "maquinaria", label: "Maquinaria y labores" },
  { value: "transporte", label: "Transporte y logística" },
  { value: "hoteleria_vacuna", label: "Hotelería vacuna" },
  { value: "granja", label: "Granjas y producción animal" },
  { value: "silos_almacenamiento", label: "Silos y almacenamiento" },
  { value: "acondicionamiento_granos", label: "Acondicionamiento de granos" },
  { value: "riego", label: "Riego y agua" },
  { value: "construcciones", label: "Construcciones rurales" },
  { value: "electricidad_iluminacion", label: "Electricidad e iluminación" },
  { value: "tecnologia_automatizacion", label: "Tecnología y automatización" },
  { value: "conectividad_monitoreo", label: "Conectividad y monitoreo" },
  { value: "alambrados", label: "Alambrados e infraestructura" },
  { value: "veterinaria", label: "Veterinaria y sanidad" },
  { value: "agronomia", label: "Agronomía y asesoramiento" },
  { value: "seguros_financiacion", label: "Seguros y financiación" },
  { value: "otro", label: "Otro servicio rural" },
];

export const SERVICIO_LABEL = Object.fromEntries(
  SERVICIOS_RURALES.map((servicio) => [servicio.value, servicio.label]),
) as Record<ServicioRural, string>;

const SERVICIO_LABEL_BR: Record<ServicioRural,string> = {
  cosecha: "Colheita", siembra: "Plantio", pulverizacion: "Pulverização",
  fertilizacion: "Adubação", maquinaria: "Máquinas e operações",
  transporte: "Transporte e logística", hoteleria_vacuna: "Confinamento bovino",
  granja: "Granjas e produção animal", silos_almacenamiento: "Silos e armazenagem",
  acondicionamiento_granos: "Beneficiamento de grãos", riego: "Irrigação e água",
  alambrados: "Cercas e infraestrutura", construcciones: "Construções rurais",
  electricidad_iluminacion: "Eletricidade e iluminação", tecnologia_automatizacion: "Tecnologia e automação",
  conectividad_monitoreo: "Conectividade e monitoramento", veterinaria: "Veterinária e saúde animal",
  agronomia: "Agronomia e consultoria", seguros_financiacion: "Seguros e financiamento",
  otro: "Outro serviço rural",
};
const SERVICIO_LABEL_US: Record<ServicioRural, string> = {
  cosecha: "Harvesting", siembra: "Planting", pulverizacion: "Crop spraying",
  fertilizacion: "Fertilization", maquinaria: "Farm machinery and fieldwork",
  transporte: "Transportation and logistics", hoteleria_vacuna: "Cattle boarding",
  granja: "Animal farming", silos_almacenamiento: "Grain storage",
  acondicionamiento_granos: "Grain conditioning", riego: "Irrigation and water",
  alambrados: "Fencing and infrastructure", construcciones: "Rural construction",
  electricidad_iluminacion: "Electrical work and lighting", tecnologia_automatizacion: "Technology and automation",
  conectividad_monitoreo: "Connectivity and monitoring", veterinaria: "Veterinary care",
  agronomia: "Agronomy and advisory", seguros_financiacion: "Insurance and financing",
  otro: "Other rural services",
};
export function servicioLabel(value: ServicioRural, country: string): string {
  return country === "BR" ? SERVICIO_LABEL_BR[value] ?? value : country === "US" ? SERVICIO_LABEL_US[value] ?? value : SERVICIO_LABEL[value] ?? value;
}

/** Título público de la publicación: nunca usar el nombre de la cuenta como título. */
export function tituloServicioRural(servicios: readonly ServicioRural[] | null | undefined, country: string, nombreComercial?: string | null): string {
  const nombre = nombreComercial?.trim();
  if (nombre) return nombre;
  const titulo = (servicios ?? []).slice(0, 2).map((servicio) => servicioLabel(servicio, country)).join(" · ");
  return titulo || (country === "BR" ? "Serviço rural" : country === "US" ? "Rural service" : "Servicio rural");
}

/** Agrupación editorial; se guardan los mismos códigos en servicios_rurales[].
 * Los primeros valores existentes siguen siendo válidos para publicaciones anteriores.
 */
export const SERVICIO_GRUPOS: ReadonlyArray<{
  key: string;
  es: string;
  pt: string;
  en: string;
  descriptionEs: string;
  descriptionPt: string;
  descriptionEn: string;
  values: readonly ServicioRural[];
}> = [
  {
    key: "agricultura",
    es: "Trabajos agrícolas",
    pt: "Operações agrícolas",
    en: "Crop and field operations",
    descriptionEs: "Preparación, siembra, cuidado y cosecha de cultivos.",
    descriptionPt: "Plantio, manejo e colheita de lavouras.",
    descriptionEn: "Planting, crop care, harvesting and machinery.",
    values: ["siembra", "cosecha", "pulverizacion", "fertilizacion", "maquinaria"],
  },
  {
    key: "ganaderia",
    es: "Ganadería y producción animal",
    pt: "Pecuária e produção animal",
    en: "Livestock and animal production",
    descriptionEs: "Cuidado, alojamiento y producción de animales.",
    descriptionPt: "Manejo, alojamento e produção animal.",
    descriptionEn: "Animal husbandry, cattle boarding and veterinary care.",
    values: ["hoteleria_vacuna", "granja", "veterinaria"],
  },
  {
    key: "infraestructura",
    es: "Infraestructura, agua y granos",
    pt: "Infraestrutura, água e grãos",
    en: "Infrastructure, water and grain",
    descriptionEs: "Obras rurales, riego, cercos y manejo de granos.",
    descriptionPt: "Construções rurais, irrigação, cercas e grãos.",
    descriptionEn: "Fencing, rural buildings, irrigation and grain facilities.",
    values: ["alambrados", "construcciones", "silos_almacenamiento", "acondicionamiento_granos", "riego"],
  },
  {
    key: "tecnologia",
    es: "Tecnología y energía rural",
    pt: "Tecnologia e energia rural",
    en: "Rural technology and energy",
    descriptionEs: "Electricidad, automatización, conectividad y monitoreo.",
    descriptionPt: "Eletricidade, automação, conectividade e monitoramento.",
    descriptionEn: "Electrical work, automation, connectivity and monitoring.",
    values: ["electricidad_iluminacion", "tecnologia_automatizacion", "conectividad_monitoreo"],
  },
  {
    key: "profesionales",
    es: "Logística y asesoramiento",
    pt: "Logística e consultoria",
    en: "Logistics and professional services",
    descriptionEs: "Transporte, agronomía, seguros y otros servicios.",
    descriptionPt: "Transporte, agronomia, seguros e outros serviços.",
    descriptionEn: "Transport, agronomy, insurance and other rural services.",
    values: ["transporte", "agronomia", "seguros_financiacion", "otro"],
  },
];

export function servicioGrupoLabel(group: (typeof SERVICIO_GRUPOS)[number], country: string): string {
  return country === "BR" ? group.pt : country === "US" ? group.en : group.es;
}

export function servicioGrupoDescripcion(group: (typeof SERVICIO_GRUPOS)[number], country: string): string {
  return country === "BR" ? group.descriptionPt : country === "US" ? group.descriptionEn : group.descriptionEs;
}

export const CENTROS_PROVINCIA: Record<string, [number, number]> = {
  "Buenos Aires": [-36.3, -60.2], CABA: [-34.61, -58.38], Catamarca: [-28.47, -65.78],
  Chaco: [-26.8, -60.9], Chubut: [-43.7, -68.8], "Córdoba": [-32.1, -63.8],
  Corrientes: [-28.8, -57.8], "Entre Ríos": [-32.1, -59.3], Formosa: [-24.9, -59.9],
  Jujuy: [-23.3, -65.8], "La Pampa": [-37.1, -65.5], "La Rioja": [-29.7, -67.2],
  Mendoza: [-34.6, -68.5], Misiones: [-26.9, -54.7], "Neuquén": [-38.9, -69.8],
  "Río Negro": [-40.2, -67.2], Salta: [-24.4, -64.9], "San Juan": [-30.9, -68.9],
  "San Luis": [-33.8, -66.1], "Santa Cruz": [-48.8, -69.9], "Santa Fe": [-30.8, -60.7],
  "Santiago del Estero": [-27.8, -63.3], "Tierra del Fuego": [-54.3, -67.8], Tucumán: [-26.9, -65.3],
};
