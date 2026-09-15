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
  { value: "alambrados", label: "Alambrados e infraestructura" },
  { value: "veterinaria", label: "Veterinaria y sanidad" },
  { value: "agronomia", label: "Agronomía y asesoramiento" },
  { value: "seguros_financiacion", label: "Seguros y financiación" },
  { value: "otro", label: "Otro servicio rural" },
];

export const SERVICIO_LABEL = Object.fromEntries(
  SERVICIOS_RURALES.map((servicio) => [servicio.value, servicio.label]),
) as Record<ServicioRural, string>;

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
