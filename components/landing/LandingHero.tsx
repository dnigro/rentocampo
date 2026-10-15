import Image from "next/image";
import RegionalLink from "@/components/layout/RegionalLink";
// Foto rural local optimizada, separada del material del hero anterior.

/**
 * V1 regional conversion hero. The original wordmark remains in the site navbar.
 * Preserve all downstream landing sections including the drone video.
 */
export default function LandingHero() {
  return (
    <section className="rc-hero-conversion" id="hero" aria-labelledby="rc-hero-conversion-title">
      <Image
        src="/hero-regional-campo-bn.webp"
        alt="Ganado pastando junto a un establecimiento rural"
        fill
        priority
        sizes="100vw"
        className="rc-hero-conversion__photo"
      />
      <div className="rc-hero-conversion__shade" aria-hidden="true" />
      <div className="rc-hero-conversion__body">
        <p className="rc-hero-conversion__eyebrow">Argentina · Uruguay · Paraguay</p>
        <h1 id="rc-hero-conversion-title">
          Registrate en la primera red federal de{" "}
          <span>servicios y tierras productivas</span> de la región.
        </h1>
        <p className="rc-hero-conversion__lead">
          Registrarte y contactar es gratis. Publicá tu primer campo o tus
          servicios rurales sin costo.
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
