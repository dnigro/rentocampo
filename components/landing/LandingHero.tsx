import Link from "next/link";
import Image from "next/image";
import heroCampo from "@/public/rentocampo-hero-campo-bn-1920x1080.webp";

export default function LandingHero() {
  return (
    <section className="rc-hero" id="hero">
      <div className="rc-hero-copy-column">
        <div className="rc-hero-index" aria-hidden="true">
          <strong>01</strong>
          <span>MÁS CAMPO<br />PARA UN<br />GRAN PAÍS</span>
        </div>
        <div className="rc-hero-content">
          <h1>
            TU CAMPO TIENE<br />
            POTENCIAL.<br />
            <span>HACELO VISIBLE.</span>
          </h1>
          <p className="rc-hero-copy">
            Conectamos propietarios con productores que buscan la tierra indicada para crecer.
          </p>
          <div className="rc-actions">
            <Link href="/register?tipo=propietario" className="rc-button rc-button-primary">
              PUBLICÁ TU CAMPO
            </Link>
            <Link href="/campos" className="rc-button rc-button-secondary">
              EXPLORAR CAMPOS <span aria-hidden="true">→</span>
            </Link>
          </div>
          <p className="rc-proof">Publicar es gratis · Contacto directo · Alcance nacional</p>
        </div>
      </div>
      <div className="rc-hero-media">
        <Image
          src={heroCampo}
          alt="Campo argentino con ganado, molino y bebedero"
          fill
          priority
          placeholder="blur"
          sizes="(max-width: 760px) 100vw, 48vw"
          className="rc-hero-image"
        />
        <div className="rc-hero-territory" aria-hidden="true">
          ARGENTINA<br />TIERRA DE<br />OPORTUNIDADES
        </div>
      </div>
    </section>
  );
}
