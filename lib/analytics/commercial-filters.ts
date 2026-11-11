/** RentoCampo — reglas permanentes de medición comercial.
 * No modifica filas ni permisos. Utilizar en consultas de tablero del servidor.
 * Nunca exponer emails de usuarios en el cliente.
 */
export const INTERNAL_TEST_EMAILS = Object.freeze([
  "dantednigro@gmail.com",
  "dantenigro@gmail.com",
]);

/** Acceso al reporte interno: independiente de las exclusiones de métricas. */
export const MANAGEMENT_REPORT_EMAILS = Object.freeze([
  "dantenigro@gmail.com",
]);

export function canAccessManagementReport(email: string | null | undefined): boolean {
  return Boolean(email && MANAGEMENT_REPORT_EMAILS.includes(email.trim().toLowerCase()));
}

export type CommercialIdentity = {
  email: string | null | undefined;
  email_confirmed_at?: string | null;
};

export function isCommercialAccount(account: CommercialIdentity): boolean {
  const email = account.email?.trim().toLowerCase();
  return Boolean(
    email &&
      !INTERNAL_TEST_EMAILS.includes(email) &&
      account.email_confirmed_at,
  );
}

export type PublicationIdentity = {
  titulo?: string | null;
  ambiente?: string | null;
  is_demo?: boolean | null;
};

const TEST_MARKER = /\b(demo|prueba|test)\b/i;

/** Conservador: ante una marca explícita DEMO no computar como parque comercial. */
export function isCommercialPublication(item: PublicationIdentity): boolean {
  return (
    item.is_demo !== true &&
    !TEST_MARKER.test(item.titulo ?? "") &&
    !TEST_MARKER.test(item.ambiente ?? "")
  );
}

export function isActiveCommercialLand(
  item: PublicationIdentity & { status: string; owner: CommercialIdentity },
): boolean {
  return (
    item.status === "activo" &&
    isCommercialAccount(item.owner) &&
    isCommercialPublication(item)
  );
}

export function isActiveCommercialService(
  item: PublicationIdentity & { activo: boolean; owner: CommercialIdentity },
): boolean {
  return (
    item.activo === true &&
    isCommercialAccount(item.owner) &&
    isCommercialPublication(item)
  );
}

export function isCommercialContact(
  sender: CommercialIdentity,
  recipient: CommercialIdentity,
): boolean {
  return isCommercialAccount(sender) && isCommercialAccount(recipient);
}
