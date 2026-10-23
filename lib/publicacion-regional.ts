import type { CountryCode } from "../data/countries.ts";

/**
 * REGIONAL PUBLISH CTA CONTRACT. Every market and every editorial/demo
 * publication should use the same authenticated/anonymous decision.
 * Real active listings keep their normal contact and detail actions.
 */
export type PublicationKind = "campo" | "servicio";
export interface RegionalPublicationRequest {
  country: CountryCode;
  kind: PublicationKind;
  authenticated: boolean;
  zona?: string;
}

export function regionalPublicationDestination({ country, kind, zona }: Omit<RegionalPublicationRequest, "authenticated">): string {
  const path = kind === "campo" ? "/mis-campos/nuevo" : "/mis-servicios-rurales/nuevo";
  const query = new URLSearchParams({ pais: country });
  if (zona?.trim()) query.set("zona", zona.trim());
  return `${path}?${query.toString()}`;
}

export function regionalPublicationHref(request: RegionalPublicationRequest): string {
  const destination = regionalPublicationDestination(request);
  return request.authenticated ? destination : `/login?next=${encodeURIComponent(destination)}`;
}

export function regionalPublicationLabel(request: Pick<RegionalPublicationRequest,"country"|"kind"|"authenticated">): string {
  if (!request.authenticated) return request.country === "BR" ? "ENTRAR PARA ANUNCIAR" : "INICIAR SESIÓN PARA PUBLICAR";
  if (request.kind === "servicio") return request.country === "BR" ? "ANUNCIAR MEUS SERVIÇOS" : "PUBLICAR MIS SERVICIOS";
  return request.country === "BR" ? "ANUNCIAR MINHA TERRA" : "PUBLICAR MI CAMPO";
}
