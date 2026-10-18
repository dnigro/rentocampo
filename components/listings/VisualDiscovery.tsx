import Image from "next/image";
import Link from "next/link";
import { COUNTRIES, type CountryCode } from "@/data/countries";

export type VisualTile = {
  src: string;
  href: string;
  title: string;
  subtitle: string;
};

type Props = {
  tipo: "campos" | "servicios";
  pais: CountryCode;
  mapHref: string;
  tiles: VisualTile[];
};

export default function VisualDiscovery({ tipo, pais, mapHref, tiles }: Props) {
  const esCampo = tipo === "campos";
  const paisNombre = COUNTRIES[pais].name;

  return (
    <section className="rc-visual-discovery" aria-label={esCampo ? "Explorador visual de campos" : "Explorador visual de servicios rurales"}>
      <div className="rc-visual-intro">
        <span className="rc-visual-kicker">RENTOCAMPO · {paisNombre.toUpperCase()}</span>
        <h2>{esCampo ? "La tierra nos conecta." : "El trabajo rural nos conecta."}</h2>
        <p>{esCampo
          ? "Explorá tierras productivas, conocé sus características y contactá directamente a sus propietarios."
          : "Encontrá personas y equipos que hacen posible la producción. Explorá servicios reales por zona y especialidad."}</p>
        <div className="rc-visual-actions">
          <Link className="rc-visual-action rc-visual-action-primary" href="#publicaciones-disponibles">
            {esCampo ? "Ver campos" : "Ver servicios"} <span aria-hidden="true">↓</span>
          </Link>
          <Link className="rc-visual-action rc-visual-action-secondary" href={mapHref}>
            Explorar en el mapa <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <div className="rc-visual-secondary-links">
          <span>Registrarte y contactar es gratis.</span>
          <Link href={esCampo ? `/servicios-rurales?pais=${pais}` : `/campos?pais=${pais}`}>
            {esCampo ? "¿Buscás servicios rurales?" : "¿Buscás un campo?"} →
          </Link>
        </div>
      </div>

      <div className={`rc-visual-gallery ${tiles.length === 0 ? "rc-visual-gallery-empty" : ""}`} aria-label="Publicaciones reales con fotografías">
        {tiles.length > 0 ? (
          tiles.slice(0, 3).map((tile, index) => (
            <Link href={tile.href} key={tile.href} className={`rc-visual-tile rc-visual-tile-${index + 1}`}>
              <Image src={tile.src} alt={tile.title} fill sizes="(max-width: 720px) 80vw, (max-width: 1100px) 45vw, 35vw" />
              <span className="rc-visual-tile-text">
                <strong>{tile.title}</strong>
                <span>{tile.subtitle}</span>
              </span>
            </Link>
          ))
        ) : (
          <div className="rc-visual-empty">
            <span className="rc-visual-empty-symbol" aria-hidden="true">RC</span>
            <strong>Una red que sigue creciendo.</strong>
            <p>Las nuevas publicaciones con fotos aparecerán acá.</p>
          </div>
        )}
      </div>
    </section>
  );
}
