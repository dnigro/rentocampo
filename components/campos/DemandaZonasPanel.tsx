import Link from "next/link";
import { COUNTRIES, type CountryCode } from "@/data/countries";
import { REGIONES_PRODUCTIVAS, REGIONES_EDITORIALES_ES } from "@/data/regiones-productivas";

interface Props {
  country: CountryCode;
  provincia?: string;
}

export default function DemandaZonasPanel({ country, provincia }: Props) {
  const isBr = country === "BR";
  const regiones = [...REGIONES_PRODUCTIVAS[country]].sort(
    (a, b) => Number(b.subdivision === provincia) - Number(a.subdivision === provincia),
  );

  return (
    <section className="rc-regions-showcase" aria-labelledby="rc-regions-title">
      <div className="rc-regions-showcase__head">
        <div>
          <p className="rc-regions-showcase__kicker">
            {isBr ? "REGIÕES PRODUTIVAS" : "REGIONES PRODUCTIVAS"} · {COUNTRIES[country].name.toUpperCase()}
          </p>
          <h2 id="rc-regions-title">
            {isBr ? "O CAMPO TEM MUITOS LUGARES. ENCONTRE O SEU." : "CADA REGIÓN TIENE SU OPORTUNIDAD."}
          </h2>
          <p className="rc-regions-showcase__description">
            {isBr ? "Do interior paulista ao Cerrado e ao Sul. Mostre sua terra na rede rural."
              : REGIONES_EDITORIALES_ES[country]}
          </p>
        </div>
        <span className="rc-regions-showcase__flag" aria-label={COUNTRIES[country].name}>
          {COUNTRIES[country].flag}
        </span>
      </div>

      <div className="rc-regions-showcase__grid">
        {regiones.map((region) => (
          <article className="rc-regions-showcase__card" key={region.zona}>
            <span className="rc-regions-showcase__area">{region.subdivision}</span>
            <h3>{region.zona}</h3>
            <p>{region.actividad}</p>
            <Link
              href={`/register?tipo=propietario&pais=${country}&zona=${encodeURIComponent(region.zona)}`}
              className="rc-regions-showcase__action"
              aria-label={isBr ? `Cadastrar para anunciar em ${region.zona}` : `Registrarme para publicar en ${region.zona}`}
            >
              {isBr ? "CADASTRAR PARA ANUNCIAR" : "REGISTRARME PARA PUBLICAR"}
              <span aria-hidden="true"> ↗</span>
            </Link>
          </article>
        ))}
      </div>
      <p className="rc-regions-showcase__disclaimer">
        {isBr
          ? "Regiões produtivas de referência. Não são indicadores de procura verificada ou negócios garantidos."
          : "Regiones productivas de referencia. No indican búsquedas verificadas ni operaciones garantizadas."}
      </p>
    </section>
  );
}
