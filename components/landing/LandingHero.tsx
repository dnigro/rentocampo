import Image from "next/image";
import RegionalLink from "@/components/layout/RegionalLink";

/** Home preview only: editable typography and CTAs over a matte licensed field photograph. */
export default function LandingHero() {
  return (
    <section className="rc-hero-conversion" id="hero" aria-labelledby="rc-hero-conversion-title">
      <Image
        src="/hero-regional-riego-bn.webp"
        alt="Sistema de riego por pivote en un campo productivo"
        fill
        priority
        sizes="100vw"
        className="rc-hero-conversion__photo"
      />
      <div className="rc-hero-conversion__shade" aria-hidden="true" />
      <div className="rc-hero-conversion__body">
        <p className="rc-hero-conversion__eyebrow">AR · UY · PY</p>
        <h1 id="rc-hero-conversion-title">
          <span className="rc-hero-conversion__heading-line">Registrate en la</span>
          <span className="rc-hero-conversion__heading-line rc-hero-conversion__heading-line--accent">primera red federal</span>
          <span className="rc-hero-conversion__heading-line">de servicios y tierras</span>
          <span className="rc-hero-conversion__heading-line">productivas de la región.</span>
        </h1>
        <p className="rc-hero-conversion__lead">
          Registrarte y contactar es gratis.<br />
          Publicá tu primer campo o tus servicios rurales sin costo.
        </p>
        <div className="rc-hero-conversion__buttons">
          <RegionalLink href="/register" className="rc-hero-conversion__btn rc-hero-conversion__btn--primary">
            Registrarme gratis <span aria-hidden="true">→</span>
          </RegionalLink>
          <RegionalLink href="/campos" className="rc-hero-conversion__btn rc-hero-conversion__btn--secondary">
            Ver campos <span aria-hidden="true">→</span>
          </RegionalLink>
        </div>
      </div>
    </section>
  );
}
