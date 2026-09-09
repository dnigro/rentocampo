import Link from "next/link";
import Image from "next/image";
import heroCampo from "@/public/landing-campo-rentocampo.jpg";
import BuscadorHero from "@/components/BuscadorHero";

export default function LandingHero() {
  return (
    <section className="rc-hero" id="hero">
      <Image src={heroCampo} alt="Campo argentino productivo" fill priority placeholder="blur" sizes="100vw" className="rc-hero-image" />
      <div className="rc-hero-shade" />
      <div className="rc-shell rc-hero-content">
        <p className="rc-kicker">Marketplace rural · Argentina</p>
        <h1>
          <span className="rc-hero-pretitle">Tu campo tiene potencial.</span>
          <span className="rc-hero-primary">Hacelo <em>visible.</em></span>
        </h1>
        <p className="rc-hero-copy">Encontrá tierra para producir o publicá tu campo y recibí consultas directas.</p>
        <BuscadorHero />
        <div className="rc-actions">
          <Link href="/register?tipo=propietario" className="rc-button rc-button-yellow">Publicar mi campo →</Link>
          <Link href="/campos" className="rc-button rc-button-light">Ver oportunidades</Link>
        </div>
        <p className="rc-proof">Sin comisiones · Contacto directo · Cobertura nacional</p>
      </div>
    </section>
  );
}
