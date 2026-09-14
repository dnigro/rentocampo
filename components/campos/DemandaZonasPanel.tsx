import Link from "next/link";
import {
  DEMANDA_DESTACADA_IDS,
  DEMANDA_ZONAS,
  type DemandaZona,
} from "@/data/demanda-zonas";

interface Props {
  provincia?: string;
}

function zonasDestacadas(provincia?: string): DemandaZona[] {
  const coincidencias = provincia
    ? DEMANDA_ZONAS.filter((demanda) => demanda.provincia === provincia)
    : [];

  if (coincidencias.length > 0) return coincidencias.slice(0, 4);

  return DEMANDA_DESTACADA_IDS.map((id) =>
    DEMANDA_ZONAS.find((demanda) => demanda.id === id),
  )
    .filter((demanda): demanda is DemandaZona => Boolean(demanda))
    .slice(0, 4);
}

export default function DemandaZonasPanel({ provincia }: Props) {
  const zonas = zonasDestacadas(provincia);

  return (
    <aside className="demanda-zonas" aria-labelledby="demanda-zonas-titulo">
      <div className="demanda-zonas-header">
        <div>
          <p className="demanda-zonas-kicker">Oportunidades</p>
          <h2 id="demanda-zonas-titulo">Demanda por zona</h2>
        </div>
        <span className="demanda-zonas-total">{DEMANDA_ZONAS.length}</span>
      </div>

      <p className="demanda-zonas-intro">
        Productores interesados en encontrar campos en distintas regiones.
      </p>

      <div className="demanda-zonas-lista">
        {zonas.map((demanda) => (
          <article className="demanda-zona-card" key={demanda.id}>
            <div className="demanda-zona-ubicacion">
              <span className="demanda-zona-punto" aria-hidden="true" />
              {demanda.provincia}
            </div>
            <h3>Buscan campos en {demanda.zona}</h3>
            <p>{demanda.descripcion}</p>
            <Link
              href={
                "/register?tipo=propietario&zona=" +
                encodeURIComponent(demanda.zona)
              }
              className="demanda-zona-cta"
            >
              Tengo un campo acá →
            </Link>
          </article>
        ))}
      </div>

      <p className="demanda-zonas-aclaracion">
        Información institucional. No representa campos publicados.
      </p>

      <Link href="/campos/mapa" className="demanda-zonas-mapa">
        Ver las {DEMANDA_ZONAS.length} zonas en el mapa
      </Link>
    </aside>
  );
}
