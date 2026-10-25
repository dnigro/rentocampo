import type { CountryCode } from "@/data/countries";
import { enUSCopy } from "@/lib/i18n/enUS-copy";

/** Common UI copy used by the legacy two-language components. */
const enCommon: Record<string, string> = {
  "Campos": "Farmland", "Terras": "Farmland", "Servicios rurales": "Rural services",
  "Cómo funciona": "How it works", "Mi cuenta": "My account", "Mi perfil": "My profile",
  "Ingresar": "Sign in", "Salir": "Log out", "Cerrar sesión": "Log out",
  "Publicar campo": "List farmland", "Publicar campo gratis": "List farmland free",
  "País": "Country", "Seleccionar país de publicaciones": "Select listing country",
  "UNIMOS EL CAMPO": "CONNECTING RURAL COMMUNITIES",
  "Campos · Productores · Servicios": "Farmland · Farmers · Services",
  "100% GRATIS,": "100% FREE,", "SUMATE": "JOIN US",
  "REGISTRATE →": "SIGN UP →", "Explorá RentoCampo": "Explore RentoCampo",
  "CAMPOS": "FARMLAND", "VER CAMPOS": "FIND FARMLAND",
  "PRODUCTORES": "FARMERS", "SOY PRODUCTOR": "I'M A FARMER",
  "SERVICIOS RURALES": "RURAL SERVICES", "VER SERVICIOS": "FIND SERVICES",
  "Inicio": "Home", "Servicios": "Services", "Registrarse": "Sign up",
  "Mi cuenta y navegación": "Account and navigation", "Registro": "Sign up",
  "Mapa": "Map", "Información": "Information", "básica": "Basic",
  "Ubicación": "Location", "del campo": "of the farmland",
  "Título del campo": "Listing title", "Descripción": "Description",
  "Características": "Characteristics", "productivas": "Agricultural",
  "Hectáreas": "Hectares", "Aptitud": "Land use",
  "Ver mapa de campos": "View farmland map", "Publicar servicio": "List service",
  "Mis campos": "My land listings", "Mis publicaciones": "My listings",
  "Mis servicios": "My services", "Mensajes": "Messages",
  "RED FEDERAL": "RURAL NETWORK", "Campos disponibles": "Available farmland",
  "Explorá tierras disponibles": "Explore available farmland",
  "Filtrar campos": "Filter farmland", "Filtrar servicios": "Filter services",
  "Ver servicios": "Browse services", "Miembros": "Members",
};

/** Optional explicit English translation takes priority over the shared copy catalog. */
export function regionalText(country: CountryCode, spanish: string, portuguese: string, english?: string): string {
  if (country === "BR") return portuguese;
  if (country === "US") return english ?? enUSCopy[spanish] ?? enCommon[spanish] ?? spanish;
  return spanish;
}
