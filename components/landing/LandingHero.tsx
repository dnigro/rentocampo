import Link from "next/link";
import Image from "next/image";
import heroCampo from "@/public/hero-campo.jpeg";
import BuscadorHero from "@/components/BuscadorHero";

export default function LandingHero() {
  return (
    <section className="rc-hero" id="hero">
      <Image src={heroCampo} alt="Campo argentino productivo" fill priority placeholder="blur" sizes="100vw" className="rc-hero-image" />
      <div className="rc-hero-shade" />
      <div className="rc-shell rc-hero-content">
        <p className="rc-kicker">Tierras que producen futuro</p>
        <h1>
          <span className="rc-hero-pretitle">Tu campo tiene potencial.</span>
          <span className="rc-hero-primary">Hacelo <em>visible.</em></span>
        </h1>
        <p className="rc-hero-copy">Conectamos dueños de campos con productores que buscan la tierra ideal para hacer crecer su futuro.</p>
        <BuscadorHero />
        <div className="rc-actions">
          <Link href="/register?tipo=propietario" className="rc-button rc-button-yellow">Publicá tu campo <span aria-hidden="true">→</span></Link>
          <Link href="/campos" className="rc-button rc-button-light">Buscá campos <span aria-hidden="true">→</span></Link>
        </div>
        <p className="rc-proof">Publicá gratis · Conectá directo · Cobertura nacional</p>
      </div>
    </section>
  );
}
