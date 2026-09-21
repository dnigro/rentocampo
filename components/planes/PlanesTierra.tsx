"use client";

import { useState } from "react";
import { PLANES_TIERRA, publicacionesLabel } from "@/data/planes-tierra";

interface Props {
  planActualId: string;
  planActualNombre: string;
  publicacionesUsadas: number;
  publicacionesReales: number;
  publicacionesLimite: number | null;
  publicacionesRestantes: number | null;
}

export default function PlanesTierra({
  planActualId,
  planActualNombre,
  publicacionesUsadas,
  publicacionesReales,
  publicacionesLimite,
  publicacionesRestantes,
}: Props) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState("");

  async function iniciarCheckout(planId: string) {
    setCheckoutError("");
    setLoadingPlan(planId);

    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const result = await response.json();

      if (!response.ok || !result.checkoutUrl) {
        throw new Error(
          result.error ?? "No se pudo iniciar el pago con Mercado Pago.",
        );
      }

      window.location.assign(result.checkoutUrl);
    } catch (error) {
      setCheckoutError(
        error instanceof Error
          ? error.message
          : "No se pudo iniciar el pago con Mercado Pago.",
      );
    } finally {
      setLoadingPlan(null);
    }
  }

  return (
    <section className="perfil-section planes-tierra-section">
      <div className="planes-tierra-heading">
        <div>
          <p className="planes-tierra-kicker">Modelo comercial · Propietarios</p>
          <h2 className="planes-tierra-title">Planes para publicar tierras</h2>
        </div>
        <div className="planes-tierra-estado">
          <span>Tu plan actual</span>
          <strong>{planActualNombre}</strong>
          <small>
            {publicacionesLimite === null
              ? `${publicacionesUsadas} utilizadas · ilimitadas disponibles`
              : `${publicacionesUsadas} utilizadas · ${publicacionesRestantes} disponibles`}
          </small>
        </div>
      </div>

      {checkoutError && (
        <div className="planes-tierra-checkout-error">{checkoutError}</div>
      )}

      <div className="planes-tierra-grid">
        {PLANES_TIERRA.map((plan) => {
          const esActual = plan.id === planActualId;
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
                disabled={esActual || loadingPlan !== null}
                aria-disabled={esActual || loadingPlan !== null}
                onClick={() => {
                  if (!esActual) void iniciarCheckout(plan.id);
                }}
              >
                {esActual
                  ? "Plan actual"
                  : loadingPlan === plan.id
                    ? "Abriendo Mercado Pago..."
                    : "Elegir plan"}
              </button>
            </article>
          );
        })}
      </div>

      <div className="planes-tierra-note">
        <strong>Modelo comercial activo.</strong> Los campos de demostración no
        consumen publicaciones. Tenés {publicacionesReales} campo{publicacionesReales === 1 ? "" : "s"} real{publicacionesReales === 1 ? "" : "es"} registrado{publicacionesReales === 1 ? "" : "s"}.
      </div>
    </section>
  );
}
