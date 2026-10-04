import Image from "next/image";
import Link from "next/link";
import heroCampoMobile from "@/public/rentocampo-hero-campo-bn-1920x1080.webp";

export default function LandingHero() {
  return (
    <section className="editorialHero" id="hero">
      <div className="editorialHero__content">
        <div className="editorialHero__desktopImpact">
          <div className="editorialHero__desktopTitleRow">
            <h1 className="editorialHero__desktopTitle">
              <span className="editorialHero__desktopYellow">#1 Red Federal</span>
              <span className="editorialHero__desktopAccentLine">
                <span>Gratis para el campo.</span>
                <span className="editorialHero__seal" aria-label="Sello RentoCampo">
                  <span className="editorialHero__sealWord">RENTOCAMPO</span>
                  <strong><span>R</span><span>C</span></strong>
                </span>
              </span>
            </h1>
          </div>

          <div className="editorialHero__desktopPillars" aria-label="Propuesta de valor">
            <span><b>+</b> Tierra productiva.</span>
            <span><b>+</b> Productores.</span>
            <span className="is-yellow"><b>+</b> Servicios rurales.</span>
          </div>

          <p className="editorialHero__desktopOnePlace">Todo en un solo lugar.</p>
          <p className="editorialHero__desktopIntro">
            Encontrá oportunidades con <strong>mapa</strong>, conectá por{" "}
            <strong>chat online</strong> y avanzá de forma directa. Registrarte,
            publicar y contactar es <strong>gratis.</strong>
          </p>

          <div className="editorialHero__desktopActions">
            <Link href="/register" className="editorialHero__desktopPrimary">
              <span>Publicá tu campo o servicio</span>
              <span aria-hidden="true">→</span>
            </Link>
            <Link href="/servicios-rurales" className="editorialHero__desktopService">
              <span>Buscá servicios</span>
              <span aria-hidden="true">→</span>
            </Link>
            <Link href="/campos" className="editorialHero__desktopSecondary">
              <span>Buscá campos</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        <div className="editorialHero__message">
          <p className="editorialHero__eyebrow">#1 Red Federal · Gratis para el campo</p>
          <h1>
            <span><b className="editorialHero__plus">+</b>Tierra productiva.</span>
            <span><b className="editorialHero__plus">+</b>Productores.</span>
            <span className="editorialHero__highlight">
              <b className="editorialHero__plus">+</b>Servicios rurales.
            </span>
            <span className="editorialHero__free">Todo en un solo lugar.</span>
          </h1>

          <p className="editorialHero__intro">
            Encontrá oportunidades con <strong>mapa</strong>, conectá por{" "}
            <strong>chat online</strong> y avanzá de forma directa. Registrarte,
            publicar y contactar es <strong>gratis.</strong>
          </p>

          <div className="editorialHero__actions">
            <Link href="/register" className="editorialHero__primary">
              <span>Publicá tu campo o servicio</span>
              <span className="editorialHero__arrow" aria-hidden="true">→</span>
            </Link>
            <Link href="/servicios-rurales" className="editorialHero__service">
              <span>Buscá servicios</span>
              <span className="editorialHero__arrow" aria-hidden="true">→</span>
            </Link>
            <Link href="/campos" className="editorialHero__secondary">
              <span>Buscá campos</span>
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
          src={heroCampoMobile}
          alt="Vacas y tambo en un entorno productivo rural"
          fill
          priority
          placeholder="blur"
          sizes="(min-width: 901px) 54vw, 1px"
          className="editorialHero__image editorialHero__image--desktop"
        />
        <Image
          src={heroCampoMobile}
          alt="Tierra productiva argentina vista desde el campo"
          fill
          priority
          placeholder="blur"
          sizes="(max-width: 900px) 100vw, 1px"
          className="editorialHero__image editorialHero__image--mobile"
        />
        <p className="editorialHero__territory" aria-hidden="true">
          Argentina / Una red federal
        </p>

      </div>
    </section>
  );
}
