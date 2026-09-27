export type AnalyticsEventName =
  | "publicar_campo"
  | "ver_mapa"
  | "ofrecer_servicio"
  | "buscar_servicio"
  | "registrarse"
  | "enviar_mensaje"
  | "iniciar_pago"
  | "checkout_mercadopago_abierto";

export function trackEvent(
  eventName: AnalyticsEventName,
  params?: Record<string, string | number | boolean>
) {
  if (typeof window === "undefined" || !window.gtag) return;

  window.gtag("event", eventName, params ?? {});
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}
