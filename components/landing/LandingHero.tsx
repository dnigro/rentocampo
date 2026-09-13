import Image from "next/image";
import Link from "next/link";
import heroCampo from "@/public/rentocampo-hero-campo-bn-1920x1080.webp";

export default function LandingHero() {
  return (
    <section className="editorialHero" id="hero">
      <div className="editorialHero__content">
        <div className="editorialHero__eyebrow" aria-hidden="true">
          <strong>01</strong>
          <span>Más campo para un gran país</span>
        </div>

        <div className="editorialHero__message">
          <h1>
            <span>Tu campo tiene</span>
            <span>potencial.</span>
            <span className="editorialHero__highlight">Hacelo visible.</span>
          </h1>

          <p>
            Conectamos propietarios con productores que buscan la tierra indicada
            para crecer.
          </p>

          <div className="editorialHero__actions">
            <Link
              href="/register?tipo=propietario"
              className="editorialHero__primary"
            >
              Publicá tu campo
              <span aria-hidden="true">→</span>
            </Link>
            <Link href="/campos" className="editorialHero__secondary">
              Explorar campos
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        <p className="editorialHero__proof">
          Publicar es gratis · Contacto directo · Alcance nacional
        </p>
      </div>

      <div className="editorialHero__visual">
        <Image
          src={heroCampo}
          alt="Campo argentino con ganado y molino"
          fill
          priority
          placeholder="blur"
          sizes="(max-width: 900px) 100vw, 50vw"
          className="editorialHero__image"
        />
        <p className="editorialHero__territory" aria-hidden="true">
          Argentina / Tierra de oportunidades
        </p>
        <p className="editorialHero__signature" aria-hidden="true">
          El campo nos une
        </p>
      </div>
    </section>
  );
}
