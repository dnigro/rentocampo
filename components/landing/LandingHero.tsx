import Link from "next/link";
import Image from "next/image";
import heroCampo from "@/public/rentocampo-hero-campo-bn-1920x1080.webp";

export default function LandingHero() {
  return (
    <section className="rc-hero" id="hero">
      <Image
        src={heroCampo}
        alt="Campo argentino con molino"
        fill
        priority
        placeholder="blur"
        sizes="100vw"
        className="rc-hero-image"
      />
      <div className="rc-hero-shade" />
      <div className="rc-hero-index" aria-hidden="true">
        <strong>01</strong>
        <span>MÁS CAMPO PARA UN GRAN PAÍS</span>
      </div>
      <div className="rc-hero-territory" aria-hidden="true">
        ARGENTINA / TIERRA DE OPORTUNIDADES
      </div>
      <div className="rc-shell rc-hero-content">
        <div className="rc-hero-main">
          <h1>Tu campo tiene potencial. Hacelo visible.</h1>
          <p className="rc-hero-copy">
            Conectamos propietarios con productores que buscan la tierra indicada para crecer.
          </p>
          <div className="rc-actions">
            <Link href="/register?tipo=propietario" className="rc-button rc-button-yellow">
              Publicá tu campo
            </Link>
            <Link href="/campos" className="rc-button rc-button-light">
              Explorar campos
            </Link>
          </div>
        </div>
        <div className="rc-hero-bottom">
          <p className="rc-proof">Publicar es gratis · Contacto directo · Alcance nacional</p>
          <p className="rc-hero-sign">EL CAMPO NOS UNE</p>
        </div>
      </div>
    </section>
  );
}
