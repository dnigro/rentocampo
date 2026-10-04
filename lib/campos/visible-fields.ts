export const DEMO_CAMPO_VISIBLE_IDS = new Set([
  "20000000-0000-4000-8000-000000000001",
  "20000000-0000-4000-8000-000000000002",
  "20000000-0000-4000-8000-000000000003",
  "20000000-0000-4000-8000-000000000004",
  "20000000-0000-4000-8000-000000000006",
]);

const REAL_FIELDS_LIMIT = 3;

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
  const argentina = campos.filter(
    (campo) => !campo.country_code || campo.country_code === "AR",
  );

  const demos = argentina.filter((campo) =>
    DEMO_CAMPO_VISIBLE_IDS.has(campo.id),
  );

  const reales = argentina
    .filter((campo) => !esCampoDemo(campo))
    .sort((a, b) => {
      const fechaA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const fechaB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return fechaB - fechaA;
    })
    .slice(0, REAL_FIELDS_LIMIT);

  return [...reales, ...demos];
}
