import Link from "next/link";
import Image from "next/image";
import heroCampo from "@/public/landing-campo-rentocampo.jpg";

export default function LandingHero() {
  return (
    <section className="rc-hero" id="hero">
      <Image src={heroCampo} alt="Campo argentino productivo" fill priority placeholder="blur" sizes="100vw" className="rc-hero-image" />
      <div className="rc-hero-shade" />
      <div className="rc-shell rc-hero-content">
        <p className="rc-kicker">Marketplace rural · Argentina</p>
        <h1>Tu campo tiene potencial.<br /><em>Hacelo visible.</em></h1>
        <p className="rc-hero-copy">Publicá gratis y conectá directamente con productores.</p>
        <div className="rc-actions">
          <Link href="/register?tipo=propietario" className="rc-button rc-button-yellow">Publicar campo →</Link>
          <Link href="/campos" className="rc-button rc-button-light">Explorar campos</Link>
        </div>
        <p className="rc-proof">Sin comisiones · Contacto directo · Vos decidís</p>
      </div>
    </section>
  );
}
