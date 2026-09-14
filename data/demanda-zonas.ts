export interface DemandaZona {
  id: string;
  zona: string;
  provincia: string;
  latitud: number;
  longitud: number;
  descripcion: string;
}

export const DEMANDA_ZONAS: DemandaZona[] = [
  { id: "pergamino", zona: "Pergamino", provincia: "Buenos Aires", latitud: -33.89, longitud: -60.57, descripcion: "Interés de productores en campos agrícolas de la zona núcleo." },
  { id: "junin", zona: "Junín", provincia: "Buenos Aires", latitud: -34.59, longitud: -60.95, descripcion: "Búsquedas de lotes agrícolas y establecimientos mixtos." },
  { id: "tandil", zona: "Tandil", provincia: "Buenos Aires", latitud: -37.33, longitud: -59.14, descripcion: "Interés en campos agrícolas, ganaderos y mixtos." },
  { id: "azul", zona: "Azul", provincia: "Buenos Aires", latitud: -36.78, longitud: -59.86, descripcion: "Demanda potencial de establecimientos ganaderos y mixtos." },
  { id: "trenque-lauquen", zona: "Trenque Lauquen", provincia: "Buenos Aires", latitud: -35.97, longitud: -62.73, descripcion: "Productores interesados en campos agrícolas y ganaderos." },
  { id: "bahia-blanca", zona: "Bahía Blanca", provincia: "Buenos Aires", latitud: -38.72, longitud: -62.27, descripcion: "Búsquedas en el sudoeste bonaerense y áreas cercanas." },
  { id: "rio-cuarto", zona: "Río Cuarto", provincia: "Córdoba", latitud: -33.13, longitud: -64.35, descripcion: "Interés en campos agrícolas y mixtos del sur cordobés." },
  { id: "marcos-juarez", zona: "Marcos Juárez", provincia: "Córdoba", latitud: -32.69, longitud: -62.11, descripcion: "Demanda de lotes productivos en el sudeste provincial." },
  { id: "villa-maria", zona: "Villa María", provincia: "Córdoba", latitud: -32.41, longitud: -63.24, descripcion: "Búsquedas agrícolas, ganaderas y tamberas en la región." },
  { id: "jesus-maria", zona: "Jesús María", provincia: "Córdoba", latitud: -30.98, longitud: -64.09, descripcion: "Interés productivo en el centro y norte de Córdoba." },
  { id: "venado-tuerto", zona: "Venado Tuerto", provincia: "Santa Fe", latitud: -33.75, longitud: -61.97, descripcion: "Demanda potencial en campos agrícolas de alta productividad." },
  { id: "rosario", zona: "Rosario", provincia: "Santa Fe", latitud: -32.95, longitud: -60.67, descripcion: "Productores buscando oportunidades en el sur santafesino." },
  { id: "rafaela", zona: "Rafaela", provincia: "Santa Fe", latitud: -31.25, longitud: -61.49, descripcion: "Interés en establecimientos mixtos, agrícolas y tamberos." },
  { id: "reconquista", zona: "Reconquista", provincia: "Santa Fe", latitud: -29.15, longitud: -59.65, descripcion: "Búsquedas ganaderas y agrícolas en el norte provincial." },
  { id: "parana", zona: "Paraná", provincia: "Entre Ríos", latitud: -31.74, longitud: -60.52, descripcion: "Interés en campos agrícolas y ganaderos entrerrianos." },
  { id: "gualeguaychu", zona: "Gualeguaychú", provincia: "Entre Ríos", latitud: -33.01, longitud: -58.52, descripcion: "Demanda potencial de establecimientos productivos." },
  { id: "general-pico", zona: "General Pico", provincia: "La Pampa", latitud: -35.66, longitud: -63.76, descripcion: "Productores interesados en campos mixtos y ganaderos." },
  { id: "mendoza", zona: "Mendoza", provincia: "Mendoza", latitud: -32.89, longitud: -68.84, descripcion: "Interés en tierras productivas y proyectos bajo riego." },
  { id: "salta", zona: "Salta", provincia: "Salta", latitud: -24.79, longitud: -65.41, descripcion: "Búsquedas agrícolas y ganaderas en el noroeste argentino." },
  { id: "alto-valle", zona: "Alto Valle", provincia: "Río Negro", latitud: -38.95, longitud: -67.99, descripcion: "Interés en tierras productivas y establecimientos bajo riego." },
];

export const DEMANDA_DESTACADA_IDS = [
  "pergamino",
  "rio-cuarto",
  "venado-tuerto",
  "general-pico",
] as const;
