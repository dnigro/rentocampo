import { Resend } from "resend";

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character] ?? character);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(new Date(value));
}

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY no está configurada");
  return new Resend(apiKey);
}

const FROM =
  process.env.RESEND_FROM_EMAIL ?? "RentoCampo <no-reply@rentocampo.com>";

const APP_URL = (
  process.env.NEXT_PUBLIC_APP_URL ?? "https://rentocampo.com"
).replace(/\/$/, "");

export async function sendPlanPurchaseConfirmation(args: {
  email: string;
  name?: string | null;
  planName: string;
  publicationLimit: number | null;
  amount: number;
  currency: string;
  startsAt: string;
  expiresAt: string;
}) {
  const greeting = args.name ? `Hola ${escapeHtml(args.name)},` : "Hola,";
  const publicationCopy =
    args.publicationLimit === null
      ? "Publicaciones ilimitadas"
      : `Hasta ${args.publicationLimit} publicaciones`;

  const resend = getResend();
  const { error } = await resend.emails.send({
    from: FROM,
    to: args.email,
    subject: "¡Gracias por tu compra! Tu plan de RentoCampo ya está activo",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:580px;margin:auto;padding:32px;background:#fff;border:1px solid #e8e6e0;border-radius:16px;color:#111">
        <p>${greeting}</p>
        <h1 style="font-size:26px;margin:14px 0;color:#111">Gracias por elegir RentoCampo</h1>
        <p>Tu pago fue aprobado y el plan <strong>${escapeHtml(args.planName)}</strong> ya está activo.</p>

        <div style="margin:24px 0;padding:18px;background:#faf8f0;border-radius:12px">
          <p style="margin:0 0 8px"><strong>Plan:</strong> ${escapeHtml(args.planName)}</p>
          <p style="margin:0 0 8px"><strong>Cupo:</strong> ${publicationCopy}</p>
          <p style="margin:0 0 8px"><strong>Vigencia:</strong> 12 meses</p>
          <p style="margin:0 0 8px"><strong>Desde:</strong> ${formatDate(args.startsAt)}</p>
          <p style="margin:0 0 8px"><strong>Hasta:</strong> ${formatDate(args.expiresAt)}</p>
          <p style="margin:0"><strong>Importe abonado:</strong> ${formatMoney(args.amount, args.currency)}</p>
        </div>

        <p>Ya podés empezar a usar tu cupo de publicaciones desde <strong>Mis campos</strong>.</p>
        <a href="${APP_URL}/mis-campos" style="display:inline-block;margin-top:14px;background:#f6c500;color:#111;padding:13px 20px;border-radius:8px;text-decoration:none;font-weight:bold">Ir a Mis campos</a>
        <p style="margin-top:28px;color:#666;font-size:13px">RentoCampo · Tierra productiva, productores y servicios rurales.</p>
      </div>`,
  });

  if (error) throw new Error(error.message);
}

export async function sendPlanQuotaExhaustedNotification(args: {
  email: string;
  name?: string | null;
  planName: string;
  publicationLimit: number;
}) {
  const greeting = args.name ? `Hola ${escapeHtml(args.name)},` : "Hola,";
  const resend = getResend();

  const { error } = await resend.emails.send({
    from: FROM,
    to: args.email,
    subject: "Usaste todas las publicaciones de tu plan RentoCampo",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:580px;margin:auto;padding:32px;background:#fff;border:1px solid #e8e6e0;border-radius:16px;color:#111">
        <p>${greeting}</p>
        <h1 style="font-size:26px;margin:14px 0;color:#111">Completaste el cupo de tu plan</h1>
        <p>El plan <strong>${escapeHtml(args.planName)}</strong> alcanzó las <strong>${args.publicationLimit} publicaciones</strong> incluidas.</p>
        <p>Para publicar una nueva oportunidad, podés contratar un nuevo paquete o elegir uno con mayor capacidad.</p>
        <a href="${APP_URL}/mis-campos" style="display:inline-block;margin-top:14px;background:#f6c500;color:#111;padding:13px 20px;border-radius:8px;text-decoration:none;font-weight:bold">Ver paquetes disponibles</a>
        <p style="margin-top:28px;color:#666;font-size:13px">Gracias por usar RentoCampo.</p>
      </div>`,
  });

  if (error) throw new Error(error.message);
}
