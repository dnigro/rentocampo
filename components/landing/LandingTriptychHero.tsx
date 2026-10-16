import Image from "next/image";
import Link from "next/link";
import RegionalLink from "@/components/layout/RegionalLink";
import fieldsPhoto from "@/public/image_eol_pix.png";
import producersPhoto from "@/public/image_vaca_pix.png";
import servicesPhoto from "@/public/image_truck_pix.png";

/**
 * Experimento visual de la portada. Tríptico editorial: Campos, Productores
 * y Servicios Rurales. Mantiene enlaces reales y selector regional del Navbar.
 */
export default function LandingTriptychHero() {
  return (
    <section className="triptychHero" id="hero" aria-labelledby="triptychHero-title">
      <div className="triptychHero__mobileHero">\n      <div className="triptychHero__intro">
        <p className="triptychHero__countries">AR · UY · PY · CL · BO · PE</p>
        <h1 className="triptychHero__title" id="triptychHero-title">
          <span>#1 RED</span>
          <strong>GRATIS PARA EL CAMPO.</strong>
        </h1>
        <p className="triptychHero__summary">
          Campos, productores y servicios rurales en un solo lugar.
        </p>
        <p className="triptychHero__detail">
          Explorá oportunidades con mapa, publicá tu primer campo gratis
          y conectá de forma directa.
        </p>
      </div>

      <nav className="triptychHero__actions" aria-label="Acciones principales">
        <RegionalLink href="/register" className="triptychHero__button triptychHero__button--register">
          <span>Registrarse</span><span aria-hidden="true">→</span>
        </RegionalLink>
      </nav>\n      </div>\n\n      <div className="triptychHero__panels" aria-label="Explorá RentoCampo">
        <Link className="triptychHero__panel triptychHero__panel--fields" href="/campos">
          <Image
            src={fieldsPhoto}
            alt=""
            fill
            priority
            sizes="(max-width: 900px) 100vw, 27vw"
            className="triptychHero__photo"
          />
          <span className="triptychHero__panelShade" aria-hidden="true" />
          <span className="triptychHero__panelContent">
            <span className="triptychHero__panelTitle">Campos</span>
            <span className="triptychHero__panelText">Venta, alquiler y oportunidades</span>
            <span className="triptychHero__panelArrow" aria-hidden="true">→</span>
          </span>
        </Link>
        <RegionalLink className="triptychHero__panel triptychHero__panel--producers" href="/register?tipo=productor">
          <Image
            src={producersPhoto}
            alt=""
            fill
            sizes="(max-width: 900px) 100vw, 27vw"
            className="triptychHero__photo"
          />
          <span className="triptychHero__panelShade" aria-hidden="true" />
          <span className="triptychHero__panelContent">
            <span className="triptychHero__panelTitle">Productores</span>
            <span className="triptychHero__panelText">Conectá y hacé crecer tu producción</span>
            <span className="triptychHero__panelArrow" aria-hidden="true">→</span>
          </span>
        </RegionalLink>
        <Link className="triptychHero__panel triptychHero__panel--services" href="/servicios-rurales">
          <Image
            src={servicesPhoto}
            alt=""
            fill
            sizes="(max-width: 900px) 100vw, 29vw"
            className="triptychHero__photo"
          />
          <span className="triptychHero__panelShade" aria-hidden="true" />
          <span className="triptychHero__panelContent">
            <span className="triptychHero__panelTitle">Servicios rurales</span>
            <span className="triptychHero__panelText">Todo el apoyo que el campo necesita</span>
            <span className="triptychHero__panelArrow" aria-hidden="true">→</span>
          </span>
        </Link>
      </div>


    </section>
  );
}
