import Link from "next/link";

export default function LandingMapa() {
  return (
    <section className="rc-map-section" id="visibilidad">
      <div className="rc-shell">
        <div className="rc-map-copy">
          <p className="rc-kicker">Campos en todo el país</p>
          <h2>Una red federal que produce.</h2>
          <p>Explorá campos disponibles en todo el país. Conectamos oportunidades en cada región productiva.</p>
          <Link href="/campos/mapa" className="rc-button rc-button-yellow">Ver mapa de campos →</Link>
        </div>
        <div className="rc-map rc-aerial-video">
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-label="Vista aérea de campos agrícolas argentinos"
          >
            <source src="/RentoCampo_video_real_dron_tractor_silos_mar_16x9.mp4.mp4#t=2" type="video/mp4" />
          </video>
        </div>
      </div>
      <div className="rc-manifesto">
        <div className="rc-manifesto-copy">
          <p className="rc-kicker">Nuestra esencia</p>
          <h2>Crecemos en el campo.<br />Crecemos en su gente.</h2>
          <p>Potenciamos el valor de la tierra conectando historias, oportunidades y futuro.</p>
          <span className="rc-manifesto-sign">Tierra · Personas · Futuro</span>
        </div>
        <div className="rc-manifesto-image" aria-hidden="true" />
      </div>
    </section>
  );
}
