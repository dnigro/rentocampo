import { COUNTRY_CODES } from "@/data/countries";

export function normalizarCoordenada(
  value: number | string | null | undefined,
): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value !== "string") return null;
  const normalized = value.trim().replace(",", ".");
  if (!normalized) return null;
  const numberValue = Number(normalized);
  return Number.isFinite(numberValue) ? numberValue : null;
}

type CampoVisible = {
  id: string;
  titulo?: string | null;
  country_code?: string | null;
  created_at?: string | null;
  latitud?: number | string | null;
  longitud?: number | string | null;
};

function esCampoDemo(campo: CampoVisible) {
  const titulo = (campo.titulo ?? "").trim().toUpperCase();
  return campo.id.startsWith("20000000-") || titulo.includes("DEMO");
}

export function seleccionarCamposPublicos<T extends CampoVisible>(
  campos: T[],
): T[] {
  const regionales = campos.filter(
    (campo) => !campo.country_code || (COUNTRY_CODES as readonly string[]).includes(campo.country_code),
  );

  // Growth model: keep transparent DEMO records for every country while
  // showing every real active listing. No hidden 3-listing commercial cap.
  const demos = regionales.filter(esCampoDemo);

  const reales = regionales
    .filter((campo) => !esCampoDemo(campo))
    .sort((a, b) => {
      const fechaA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const fechaB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return fechaB - fechaA;
    });

  return [...reales, ...demos];
}
