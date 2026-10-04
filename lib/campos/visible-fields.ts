export const DEMO_CAMPO_VISIBLE_IDS = new Set([
  "20000000-0000-4000-8000-000000000001",
  "20000000-0000-4000-8000-000000000002",
  "20000000-0000-4000-8000-000000000003",
  "20000000-0000-4000-8000-000000000004",
  "20000000-0000-4000-8000-000000000006",
]);

const REAL_FIELDS_LIMIT = 3;

type CampoVisible = {
  id: string;
  titulo?: string | null;
  country_code?: string | null;
  created_at?: string | null;
  latitud?: number | string | null;
  longitud?: number | string | null;
};

function tieneCoordenadasValidas(campo: CampoVisible) {
  const lat = Number(campo.latitud);
  const lng = Number(campo.longitud);
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

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
