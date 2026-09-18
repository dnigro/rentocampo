import { PROVINCIAS_ARG, type AptitudCampo } from "@/types";

export const SITE_URL = "https://rentocampo.com";

export const APTITUD_SEO: Record<
  string,
  { value: AptitudCampo; label: string; singular: string }
> = {
  agricolas: {
    value: "agricola",
    label: "Campos agrícolas",
    singular: "agrícola",
  },
  ganaderos: {
    value: "ganadera",
    label: "Campos ganaderos",
    singular: "ganadero",
  },
  mixtos: { value: "mixta", label: "Campos mixtos", singular: "mixto" },
  forestales: {
    value: "forestal",
    label: "Campos forestales",
    singular: "forestal",
  },
};

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const PROVINCIAS_POR_SLUG = Object.fromEntries(
  PROVINCIAS_ARG.map((provincia) => [slugify(provincia), provincia]),
) as Record<string, (typeof PROVINCIAS_ARG)[number]>;

export function campoDescription(campo: {
  hectareas?: number | null;
  localidad?: string | null;
  provincia?: string | null;
  aptitud?: string | null;
}) {
  const aptitud =
    Object.values(APTITUD_SEO).find((item) => item.value === campo.aptitud)
      ?.singular ??
    campo.aptitud ??
    "rural";
  const ubicacion = [campo.localidad, campo.provincia]
    .filter(Boolean)
    .join(", ");
  const superficie = campo.hectareas
    ? `${Number(campo.hectareas).toLocaleString("es-AR")} hectáreas`
    : "superficie informada";

  return `Conocé este campo ${aptitud} de ${superficie}${ubicacion ? ` en ${ubicacion}` : ""}. Revisá sus características y conversá directamente con el propietario en RentoCampo.`;
}

export function campoSeoTitle(campo: {
  titulo?: string | null;
  hectareas?: number | null;
  localidad?: string | null;
  provincia?: string | null;
  aptitud?: string | null;
}) {
  const aptitud =
    Object.values(APTITUD_SEO).find((item) => item.value === campo.aptitud)
      ?.singular ??
    campo.aptitud ??
    "rural";
  const superficie = campo.hectareas
    ? ` de ${Number(campo.hectareas).toLocaleString("es-AR")} ha`
    : "";
  const ubicacion = campo.localidad ?? campo.provincia;

  if (ubicacion) {
    return `Campo ${aptitud}${superficie} en ${ubicacion} | RentoCampo`;
  }

  return `${campo.titulo || `Campo ${aptitud}`} | RentoCampo`;
}
