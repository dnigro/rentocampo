/**
 * Textos publicos: el contacto se hace por chat; teléfonos y correo pertenecen
 * a campos privados del perfil, no a títulos, descripciones ni ubicaciones.
 * Reutilizado en navegador y servidor.
 */
export type OpcionesTexto = { required?: boolean; min?: number; max?: number };

const EMAIL = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;
const URL = /(?:https?:\/\/|www\.|wa\.me\/|t\.me\/|(?:^|[\s/(])[\w-]+\.(?:com(?:\.[a-z]{2,3})?|net|org|io|app|co|ar|br|link|site|online)\b)/i;
const HANDLE = /(?:^|[\s:(])@[\w.]{3,}/i;
const PHONE = /(?:^|[^\d])\+?(?:\(?\d\)?[\s.-]*){9,15}(?!\d)/;
const CONTACT = /\b(?:whats?app|telegram|enviame\s+(?:un\s+)?(?:sms|mensaje)\s+al|ll[aá]mame\s+al)\b/i;
const CONTROL = /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/;

export function errorTextoPublico(
  value: unknown, etiqueta: string,
  { required = false, min = 0, max = 250 }: OpcionesTexto = {},
): string | null {
  if (value === null || value === undefined || value === "") {
    return required ? "Completá " + etiqueta.toLowerCase() + "." : null;
  }
  if (typeof value !== "string") return etiqueta + ": ingresá texto válido.";
  const texto = value.trim();
  if (!texto) return required ? "Completá " + etiqueta.toLowerCase() + "." : null;
  if (texto.length < min) return etiqueta + ": escribí al menos " + min + " caracteres.";
  if (texto.length > max) return etiqueta + ": máximo " + max + " caracteres.";
  if (CONTROL.test(texto)) return etiqueta + ": eliminá caracteres no permitidos.";
  if (EMAIL.test(texto) || URL.test(texto) || HANDLE.test(texto) || PHONE.test(texto) || CONTACT.test(texto)) {
    return etiqueta + ": no incluyas teléfonos, emails, redes sociales ni enlaces. Usá el chat de RentoCampo para contactar.";
  }
  if (required && !/[a-záéíóúñãõâêîôûü]/i.test(texto)) {
    return etiqueta + ": escribí un título descriptivo, no solo números.";
  }
  return null;
}

export function errorCampoPublico(form: Record<string, unknown>): string | null {
  const campos = [
    ["titulo", "Título de la publicación", 100, true, 5],
    ["descripcion", "Descripción del campo", 2500, false, 0],
    ["ubicacion", "Ubicación", 250, true, 3],
    ["provincia", "Provincia o estado", 120, true, 2],
    ["departamento", "Departamento o partido", 120, false, 0],
    ["localidad", "Localidad", 120, false, 0],
    ["ambiente", "Suelo o ambiente", 250, false, 0],
    ["rendimiento_estimado", "Rendimiento", 120, false, 0],
  ] as const;
  for (const [key, label, max, required, min] of campos) {
    const error = errorTextoPublico(form[key], label, { max, required, min });
    if (error) return error;
  }
  if (typeof form.hectareas !== "number" || !Number.isFinite(form.hectareas) ||
      form.hectareas <= 0 || form.hectareas > 100000000) {
    return "Superficie: ingresá hectáreas mayores que cero.";
  }
  if (form.precio !== undefined && form.precio !== null && form.precio !== "" &&
      (typeof form.precio !== "number" || !Number.isFinite(form.precio) || form.precio <= 0)) {
    return "Precio: ingresá un importe positivo o dejalo vacío si es a convenir.";
  }
  if (!["agricola","ganadera","mixta","forestal","otro"].includes(String(form.aptitud))) {
    return "Seleccioná un uso principal válido.";
  }
  if (!["alquiler","venta","ambas"].includes(String(form.operacion))) {
    return "Seleccioná alquiler, venta o ambas operaciones.";
  }
  if (!["inmediata","campaña_próxima","a_convenir"].includes(String(form.disponibilidad))) {
    return "Seleccioná una disponibilidad válida.";
  }
  if (typeof form.latitud !== "number" || typeof form.longitud !== "number" ||
      !Number.isFinite(form.latitud) || !Number.isFinite(form.longitud) ||
      Math.abs(form.latitud) > 90 || Math.abs(form.longitud) > 180) {
    return "Seleccioná un punto válido desde el buscador del mapa.";
  }
  return null;
}

export function errorServicioPublico(form: Record<string, unknown>, validServices: readonly string[]): string | null {
  const campos = [
    ["nombre_comercial", "Título del servicio", 100, true, 5],
    ["detalle", "Descripción del servicio", 2500, false, 0],
    ["zona", "Zona de trabajo", 200, false, 0],
    ["provincia", "Provincia o estado", 120, true, 2],
    ["localidad", "Localidad", 120, false, 0],
  ] as const;
  for (const [key, label, max, required, min] of campos) {
    const error = errorTextoPublico(form[key], label, { max, required, min });
    if (error) return error;
  }
  const rubros = form.servicios_rurales;
  if (!Array.isArray(rubros) || rubros.length === 0 || rubros.length > validServices.length ||
      rubros.some(x => typeof x !== "string" || !validServices.includes(x)) ||
      new Set(rubros).size !== rubros.length) {
    return "Seleccioná actividades rurales válidas, sin repetirlas.";
  }
  if (typeof form.latitud !== "number" || typeof form.longitud !== "number" ||
      !Number.isFinite(form.latitud) || !Number.isFinite(form.longitud) ||
      Math.abs(form.latitud) > 90 || Math.abs(form.longitud) > 180) {
    return "Seleccioná una zona desde el buscador del mapa.";
  }
  const fotos = form.fotos_urls;
  if (!Array.isArray(fotos) || fotos.length < 1 || fotos.length > 8 ||
      fotos.some(url => typeof url !== "string" || !/^https:\/\//i.test(url) || url.length > 1500)) {
    return "Subí entre una y ocho imágenes válidas del servicio.";
  }
  return null;
}
