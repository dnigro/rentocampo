"use client";

import Link from "next/link";

export default function LandingMapa() {
  return (
    <section className="rc-map-section" id="visibilidad">
      <div className="rc-shell">
        <div className="rc-map-copy">
          <p className="rc-kicker">Campos en todo el país</p>
          <h2 className="rc-map-title">La Primera Red Federal</h2>
          <p>Explorá campos disponibles en todo el país. Conectamos oportunidades en cada región productiva.</p>
          <Link href="/campos/mapa" className="rc-button rc-button-yellow">Ver mapa de campos →</Link>
        </div>
        <div className="rc-map rc-aerial-video">
          <video
            autoPlay
            muted
            playsInline
            preload="metadata"
            aria-label="Vista aérea de campos agrícolas argentinos"
            onTimeUpdate={(event) => {
              const video = event.currentTarget;
              if (Number.isFinite(video.duration) && video.currentTime >= video.duration - 1.1) {
                video.currentTime = 2;
                void video.play();
              }
            }}
          >
            <source src="/RentoCampo_video_real_dron_tractor_silos_mar_16x9.mp4.mp4#t=2" type="video/mp4" />
          </video>
        </div>
      </div>
    </section>
  );
}
