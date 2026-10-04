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
  country_code?: string | null;
  created_at?: string | null;
  latitud?: number | null;
  longitud?: number | null;
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

export function seleccionarCamposPublicos<T extends CampoVisible>(
  campos: T[],
): T[] {
  const argentina = campos.filter(
    (campo) =>
      (!campo.country_code || campo.country_code === "AR") &&
      tieneCoordenadasValidas(campo),
  );

  const demos = argentina.filter((campo) =>
    DEMO_CAMPO_VISIBLE_IDS.has(campo.id),
  );

  const reales = argentina
    .filter((campo) => !campo.id.startsWith("20000000-"))
    .sort((a, b) => {
      const fechaA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const fechaB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return fechaB - fechaA;
    })
    .slice(0, REAL_FIELDS_LIMIT);

  return [...reales, ...demos];
}
