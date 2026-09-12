import Link from "next/link";
import Image from "next/image";
import heroCampo from "@/public/rentocampo-hero-campo-bn-1920x1080.webp";
import BuscadorHero from "@/components/BuscadorHero";

export default function LandingHero() {
  return (
    <section className="rc-hero" id="hero">
      <Image src={heroCampo} alt="Campo argentino productivo" fill priority placeholder="blur" sizes="100vw" className="rc-hero-image" />
      <div className="rc-hero-shade" />
      <div className="rc-hero-index" aria-hidden="true"><strong>01</strong><span>Más campo<br />para un<br />gran país</span></div>
      <div className="rc-hero-territory" aria-hidden="true">Argentina<br />tierra de<br />oportunidades</div>
      <div className="rc-shell rc-hero-content">
        <div className="rc-hero-heading">
          <h1>Tu campo tiene<br />potencial. <span>Hacelo visible.</span></h1>
        </div>
        <div className="rc-hero-footer">
          <p className="rc-hero-copy">Conectamos propietarios con productores que buscan la tierra indicada para crecer.</p>
          <BuscadorHero />
          <div className="rc-actions">
            <Link href="/register?tipo=propietario" className="rc-button rc-button-yellow">Publicá tu campo <span aria-hidden="true">→</span></Link>
            <Link href="/campos" className="rc-button rc-button-light">Explorar campos</Link>
          </div>
          <p className="rc-proof">Publicar es gratis · Contacto directo · Alcance nacional</p>
        </div>
      </div>
    </section>
  );
}
