/**
 * Contrato tipado de eventos de RentoCampo App.
 *
 * No envía telemetría ni inicializa SDKs: el adaptador Firebase/GA4
 * se implementará tras validar consentimiento, plataforma y privacidad.
 */
export type MobileCountryCode = "AR" | "UY";
export type MobileListingType = "campo" | "servicio";

export type MobileAnalyticsEvent =
  | { name: "app_open"; params: { country_code: MobileCountryCode } }
  | { name: "screen_view"; params: { screen_name: string; country_code: MobileCountryCode } }
  | { name: "view_item"; params: { item_id: string; item_type: MobileListingType; country_code: MobileCountryCode } }
  | { name: "contact_intent"; params: { item_id: string; item_type: MobileListingType; country_code: MobileCountryCode } }
  | { name: "sign_up"; params: { method: "email" | "oauth"; country_code: MobileCountryCode } };

export type MobileAnalyticsTransport = (event: MobileAnalyticsEvent) => void | Promise<void>;

export function createMobileAnalytics(transport: MobileAnalyticsTransport) {
  return {
    track(event: MobileAnalyticsEvent) {
      return transport(event);
    },
  };
}
