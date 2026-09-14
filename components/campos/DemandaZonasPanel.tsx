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
      <p className="demanda-zonas-kicker">Demanda activa · Argentina</p>
      <h2 id="demanda-zonas-titulo">Hay productores buscando tierra.</h2>
      <p className="demanda-zonas-intro">
        Conocé qué buscan y en qué zonas.
      </p>

      <div className="demanda-zonas-lista">
        {zonas.map((demanda) => (
          <article className="demanda-zona-card" key={demanda.id}>
            <span className="demanda-zona-punto" aria-hidden="true" />
            <div>
              <h3>{demanda.zona}</h3>
              <p>{demanda.provincia}</p>
            </div>
            <Link
              href={
                "/register?tipo=propietario&zona=" +
                encodeURIComponent(demanda.zona)
              }
              className="demanda-zona-cta"
              aria-label={"Tengo un campo en " + demanda.zona}
            >
              →
            </Link>
          </article>
        ))}
      </div>

      <Link href="/campos/mapa" className="demanda-zonas-mapa">
        Ver demanda por zona <span aria-hidden="true">→</span>
      </Link>

      <p className="demanda-zonas-aclaracion">
        Señales orientativas de búsqueda. No representan campos publicados.
      </p>
    </aside>
  );
}
