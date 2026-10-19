"use client";

import { useState } from "react";
import { PLANES_TIERRA, planTierraRank, publicacionesLabel } from "@/data/planes-tierra";
import { trackEvent } from "@/lib/analytics";
import { COUNTRIES, type CountryCode } from "@/data/countries";
import { regionalText } from "@/lib/i18n/regional";

interface Props {
  planActualId: string;
  planActualNombre: string;
  publicacionesUsadas: number;
  publicacionesReales: number;
  publicacionesLimite: number | null;
  publicacionesRestantes: number | null;
  expiryLabel: string | null;
  expiryDays: number | null;
  countryCode: CountryCode | null;
}

export default function PlanesTierra({
  planActualId,
  planActualNombre,
  publicacionesReales,
  publicacionesLimite,
  publicacionesRestantes,
  expiryLabel,
  expiryDays,
  countryCode,
}: Props) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState("");
  const [checkoutNotice, setCheckoutNotice] = useState("");
  const paidPlansEnabled = countryCode === "AR";
  const tt=(es:string,pt:string)=>regionalText(countryCode??"AR",es,pt);
  const countryLabel = countryCode ? COUNTRIES[countryCode].name : "tu país";

  async function iniciarCheckout(planId: string) {
    if (!paidPlansEnabled) return;
    setCheckoutError("");
    setCheckoutNotice("");

    const plan = PLANES_TIERRA.find((item) => item.id === planId);
    trackEvent("iniciar_pago", {
      plan_id: planId,
      plan_nombre: plan?.nombre ?? planId,
      valor_usd: plan?.precioUsdAnual ?? 0,
      moneda_referencia: "USD",
      pagina_origen: window.location.pathname,
      proveedor_pago: "mercadopago",
    });
    setLoadingPlan(planId);

    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const result = await response.json();

      if (response.status === 403 && result.code === "billing_country_unsupported") {
        setCheckoutNotice(result.message ?? result.error ?? "La compra de paquetes todavía no está disponible en tu país.");
        return;
      }

      if (!response.ok || !result.checkoutUrl) {
        throw new Error(
          result.error ?? "No se pudo iniciar el pago con Mercado Pago.",
        );
      }

      trackEvent("checkout_mercadopago_abierto", {
        plan_id: planId,
        plan_nombre: plan?.nombre ?? planId,
        valor_usd: plan?.precioUsdAnual ?? 0,
        moneda_referencia: "USD",
        pagina_origen: window.location.pathname,
        proveedor_pago: "mercadopago",
      });

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
          <p className="planes-tierra-kicker">{tt("Modelo comercial · Propietarios","Modelo comercial · Proprietários")}</p>
          <h2 className="planes-tierra-title">{tt("Planes para publicar tierras","Planos para anunciar terras")}</h2>
        </div>
        <div className="planes-tierra-estado">
          <span>{tt("Tu plan actual","Seu plano atual")}</span>
          <strong>{planActualNombre}</strong>
          {publicacionesLimite !== null && (
            <small>
              {publicacionesRestantes} {tt("disponible","disponível")}{publicacionesRestantes === 1 ? "" : tt("s","is")} {tt("de","de")} {publicacionesLimite}
            </small>
          )}
          {expiryLabel && (
            <small>
              {tt("Vigente hasta el","Válido até")} {expiryLabel}
            </small>
          )}
        </div>
      </div>

      {expiryDays !== null && expiryDays <= 30 && (
        <div className="planes-tierra-expiry-alert">
          <strong>
            {expiryDays === 0
              ? "Tu plan vence hoy."
              : `Tu plan vence en ${expiryDays} día${expiryDays === 1 ? "" : "s"}.`}
          </strong>{" "}
          Renová el plan para mantener disponible tu cupo de publicaciones.
        </div>
      )}

      {!paidPlansEnabled && (
        <div className="planes-tierra-region-notice" role="status">
          <strong>{tt("Estamos llegando a","Estamos chegando ao")} {countryLabel}</strong>
          <p>{tt("La compra de paquetes de publicaciones todavía no está disponible en tu país. Estamos trabajando para habilitarla.","A compra de pacotes de anúncios ainda não está disponível no Brasil. Estamos trabalhando para habilitá-la.")}</p>
          <p>{tt("Mientras tanto, podés publicar tu primer campo gratis y utilizar los servicios rurales sin costo.","Enquanto isso, anuncie sua primeira terra gratuitamente e utilize os serviços rurais sem custo.")}</p>
        </div>
      )}

      {checkoutNotice && (
        <div className="planes-tierra-region-notice" role="status">{checkoutNotice}</div>
      )}

      {checkoutError && (
        <div className="planes-tierra-checkout-error" role="alert">{checkoutError}</div>
      )}

      <div className="planes-tierra-grid">
        {PLANES_TIERRA.map((plan) => {
          const esActual = plan.id === planActualId;
          const esInferior = planTierraRank(plan.id) < planTierraRank(planActualId);
          const bloqueadoPorPlan = esActual || esInferior;
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
                  <span className="plan-tierra-badge">{tt("RECOMENDADO","RECOMENDADO")}</span>
                )}
                {esActual && (
                  <span className="plan-tierra-badge plan-tierra-badge-actual">
                    {tt("TU PLAN ACTUAL","SEU PLANO ATUAL")}
                  </span>
                )}
                <h3>{tt(plan.nombre,plan.nombre)}</h3>
                <p className="plan-tierra-profile">{plan.perfilIdeal}</p>
                <p>{plan.bajada}</p>
              </div>

              <div className="plan-tierra-price">
                {plan.precioUsdAnual === 0 ? (
                  <strong>{tt("Gratis","Grátis")}</strong>
                ) : !paidPlansEnabled ? (
                  <strong className="plan-tierra-price-soon">{tt("Próximamente","Em breve")}</strong>
                ) : (
                  <>
                    <strong>USD {plan.precioUsdAnual}</strong>
                    <span>{tt("/ año","/ ano")}</span>
                  </>
                )}
              </div>

              <ul>
                <li>{publicacionesLabel(plan)}</li>
                <li>{tt("Vigencia de 12 meses","Validade de 12 meses")}</li>
                <li>
                  {plan.publicaciones === null
                    ? tt("Sin límite de oportunidades","Oportunidades ilimitadas")
                     : tt("Cada nueva publicación consume 1 cupo","Cada novo anúncio utiliza 1 vaga")}
                </li>
              </ul>

              <p className="plan-tierra-audience">{plan.publicoObjetivo}</p>

              <button
                type="button"
                className="plan-tierra-button"
                disabled={bloqueadoPorPlan || !paidPlansEnabled || loadingPlan !== null}
                aria-disabled={bloqueadoPorPlan || !paidPlansEnabled || loadingPlan !== null}
                onClick={() => {
                  if (!bloqueadoPorPlan) void iniciarCheckout(plan.id);
                }}
              >
                {esActual
                  ? tt("Plan actual","Plano atual")
                  : esInferior
                    ? tt("Incluido en tu plan","Incluído no seu plano")
                    : !paidPlansEnabled
                      ? tt("No disponible aún","Ainda indisponível")
                    : loadingPlan === plan.id
                      ? tt("Abriendo Mercado Pago...","Abrindo Mercado Pago...")
                      : tt("Elegir plan","Escolher plano")}
              </button>
            </article>
          );
        })}
      </div>

      <div className="planes-tierra-note">
        <strong>{paidPlansEnabled ? "Modelo comercial activo." : tt("Paquetes en preparación.","Pacotes em preparação.")}</strong> Los campos de demostración no
        consumen publicaciones. Tenés {publicacionesReales} campo{publicacionesReales === 1 ? "" : "s"} real{publicacionesReales === 1 ? "" : "es"} registrado{publicacionesReales === 1 ? "" : "s"}.
      </div>
    </section>
  );
}
