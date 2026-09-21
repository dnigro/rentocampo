"use client";

import { PLANES_TIERRA, publicacionesLabel } from "@/data/planes-tierra";

interface Props {
  publicacionesUsadas: number;
}

export default function PlanesTierra({ publicacionesUsadas }: Props) {
  return (
    <section className="perfil-section planes-tierra-section">
      <div className="planes-tierra-heading">
        <div>
          <p className="planes-tierra-kicker">Modelo comercial · Propietarios</p>
          <h2 className="planes-tierra-title">Planes para publicar tierras</h2>
        </div>
        <div className="planes-tierra-estado">
          <span>Tu plan actual</span>
          <strong>Tierra Inicial</strong>
          <small>
            {publicacionesUsadas} publicación{publicacionesUsadas === 1 ? "" : "es"} real{publicacionesUsadas === 1 ? "" : "es"} registrada{publicacionesUsadas === 1 ? "" : "s"}
          </small>
        </div>
      </div>

      <div className="planes-tierra-grid">
        {PLANES_TIERRA.map((plan) => {
          const esActual = plan.id === "inicial";
          return (
            <article
              key={plan.id}
              className={[
                "plan-tierra-card",
                plan.recomendado ? "plan-tierra-card-recomendado" : "",
                esActual ? "plan-tierra-card-actual" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <div className="plan-tierra-card-top">
                {plan.recomendado && (
                  <span className="plan-tierra-badge">RECOMENDADO</span>
                )}
                {esActual && (
                  <span className="plan-tierra-badge plan-tierra-badge-actual">
                    TU PLAN ACTUAL
                  </span>
                )}
                <h3>{plan.nombre}</h3>
                <p className="plan-tierra-profile">{plan.perfilIdeal}</p>
                <p>{plan.bajada}</p>
              </div>

              <div className="plan-tierra-price">
                {plan.precioUsdAnual === 0 ? (
                  <strong>Gratis</strong>
                ) : (
                  <>
                    <strong>USD {plan.precioUsdAnual}</strong>
                    <span>/ año</span>
                  </>
                )}
              </div>

              <ul>
                <li>{publicacionesLabel(plan)}</li>
                <li>Vigencia de 12 meses</li>
                <li>
                  {plan.publicaciones === null
                    ? "Sin límite de oportunidades"
                    : "Cada nueva publicación consume 1 cupo"}
                </li>
              </ul>

              <p className="plan-tierra-audience">{plan.publicoObjetivo}</p>

              <button
                type="button"
                className="plan-tierra-button"
                disabled
                aria-disabled="true"
              >
                {esActual ? "Plan actual" : "Próximamente"}
              </button>
            </article>
          );
        })}
      </div>

      <div className="planes-tierra-note">
        <strong>Etapa de validación comercial.</strong> Todavía no hay cobros ni
        límites activos. Los campos de demostración no consumen publicaciones.
      </div>
    </section>
  );
}
