import Image from "next/image";
import Link from "next/link";
import heroCampo from "@/public/rentocampo-hero-campo-bn-1920x1080.webp";

export default function LandingHero() {
  return (
    <section className="editorialHero" id="hero">
      <div className="editorialHero__content">
        <div className="editorialHero__message">
          <p className="editorialHero__eyebrow">Una red federal que produce</p>
          <h1>
            <span>Tierra productiva.</span>
            <span>Productores.</span>
            <span className="editorialHero__highlight">Servicios rurales.</span>
            <span className="editorialHero__free">
              Todo en un solo lugar.
            </span>
          </h1>

          <p>
            Encontrá oportunidades en el mapa, conectá por chat y avanzá de
            forma directa. Registrarte, publicar y contactar es <strong>gratis.</strong>
          </p>

          <div className="editorialHero__actions">
            <Link
              href="/register"
              className="editorialHero__primary"
            >
              <span>Sumarme gratis</span>
              <span className="editorialHero__arrow" aria-hidden="true">→</span>
            </Link>
            <Link href="/campos/mapa" className="editorialHero__secondary">
              <span>Explorar el mapa</span>
              <span className="editorialHero__arrow" aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        <p className="editorialHero__proof">
          De cada región productiva de la Argentina, para todo el país
        </p>
      </div>

      <div className="editorialHero__visual">
        <Image
          src={heroCampo}
          alt="Tierra productiva argentina vista desde el campo"
          fill
          priority
          placeholder="blur"
          sizes="(max-width: 900px) 100vw, 50vw"
          className="editorialHero__image"
        />
        <p className="editorialHero__territory" aria-hidden="true">
          Argentina / Una red federal
        </p>
        <p className="editorialHero__signature" aria-hidden="true">
          La producción nos conecta
        </p>
      </div>
    </section>
  );
}
