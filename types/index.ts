// types/index.ts — RentaCampo

// ============================================================
// ENUMS
// ============================================================
export type TipoPerfil = "propietario" | "productor";
export type RolPerfil = TipoPerfil;

export type AptitudCampo =
  | "agricola"
  | "ganadera"
  | "mixta"
  | "forestal"
  | "otro";

export type EstadoCampo = "activo" | "pausado" | "arrendado" | "borrador";

export type DisponibilidadCampo =
  | "inmediata"
  | "campaña_próxima"
  | "a_convenir";

export type MonedaCampo = "USD" | "ARS";

// ============================================================
// MODELOS
// ============================================================
export interface Profile {
  id: string;
  roles: RolPerfil[];
  nombre: string;
  apellido?: string;
  telefono?: string;
  bio?: string;
  avatar_url?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Campo {
  id: string;
  propietario_id: string;
  titulo: string;
  descripcion?: string;
  ubicacion: string;
  provincia: string;
  departamento?: string;
  localidad?: string;
  latitud?: number;
  longitud?: number;
  hectareas: number;
  aptitud: AptitudCampo;
  ambiente?: string;
  precio?: number;
  moneda: MonedaCampo;
  disponibilidad: DisponibilidadCampo;
  disponibilidad_desde?: string;
  rendimiento_estimado?: string;
  mejoras: string;
  status: EstadoCampo;
  created_at: string;
  updated_at: string;
  // joins opcionales
  fotos?: CampoFoto[];
  propietario?: Profile;
}

export interface CampoFoto {
  id: string;
  campo_id: string;
  url: string;
  orden: number;
  created_at: string;
}

export interface Favorito {
  id: string;
  usuario_id: string;
  campo_id: string;
  created_at: string;
  campo?: Campo;
}

export interface Mensaje {
  id: string;
  campo_id: string;
  remitente_id: string;
  destinatario_id: string;
  contenido: string;
  leido: boolean;
  created_at: string;
  remitente?: Profile;
  destinatario?: Profile;
  campo?: Pick<Campo, "id" | "titulo">;
}

// ============================================================
// FILTROS DEL EXPLORADOR
// ============================================================
export interface CampoFiltros {
  provincia?: string;
  departamento?: string;
  aptitud?: AptitudCampo;
  hectareas_min?: number;
  hectareas_max?: number;
  precio_min?: number;
  precio_max?: number;
  disponibilidad?: DisponibilidadCampo;
  moneda?: MonedaCampo;
}

// ============================================================
// FORMULARIOS
// ============================================================
export interface CampoFormData {
  titulo: string;
  descripcion?: string;
  ubicacion: string;
  provincia: string;
  departamento?: string;
  localidad?: string;
  latitud?: number;
  longitud?: number;
  hectareas: number;
  aptitud: AptitudCampo;
  ambiente?: string;
  precio?: number;
  moneda: MonedaCampo;
  disponibilidad: DisponibilidadCampo;
  rendimiento_estimado?: string;
  mejoras: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  nombre: string;
  telefono?: string;
  provincia?: string;
}

// ============================================================
// RESPUESTAS PAGINADAS
// ============================================================
export interface PaginatedResult<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============================================================
// PROVINCIAS ARGENTINA (para selects)
// ============================================================
export const PROVINCIAS_ARG = [
  "Buenos Aires",
  "CABA",
  "Catamarca",
  "Chaco",
  "Chubut",
  "Córdoba",
  "Corrientes",
  "Entre Ríos",
  "Formosa",
  "Jujuy",
  "La Pampa",
  "La Rioja",
  "Mendoza",
  "Misiones",
  "Neuquén",
  "Río Negro",
  "Salta",
  "San Juan",
  "San Luis",
  "Santa Cruz",
  "Santa Fe",
  "Santiago del Estero",
  "Tierra del Fuego",
  "Tucumán",
] as const;

export type ProvinciaArg = (typeof PROVINCIAS_ARG)[number];
