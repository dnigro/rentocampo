export type AnalyticsEventName =
  | "publicar_campo"
  | "ver_mapa"
  | "ofrecer_servicio"
  | "buscar_servicio"
  | "registrarse"
  | "enviar_mensaje"
  | "iniciar_pago"
  | "checkout_mercadopago_abierto";

const GA4_CONVERSION_ALIASES: Partial<Record<AnalyticsEventName, string>> = {
  registrarse: "sign_up",
  publicar_campo: "publish_land",
  enviar_mensaje: "generate_lead",
};

export function trackEvent(
  eventName: AnalyticsEventName,
  params?: Record<string, string | number | boolean>
) {
  if (typeof window === "undefined" || !window.gtag) return;

  const eventParams = params ?? {};
  window.gtag("event", eventName, eventParams);

  const ga4Alias = GA4_CONVERSION_ALIASES[eventName];
  if (ga4Alias) {
    window.gtag("event", ga4Alias, {
      ...eventParams,
      rentocampo_event: eventName,
    });
  }
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}
