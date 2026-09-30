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

const EMAIL_SHELL_STYLE =
  "font-family:Arial,sans-serif;max-width:580px;margin:0 auto;padding:24px 20px;background:#fff;border:1px solid #e8e6e0;border-radius:16px;color:#111;box-sizing:border-box;overflow-wrap:break-word;word-break:normal";

const EMAIL_HEADING_STYLE =
  "font-size:22px;line-height:1.15;margin:14px 0 18px;color:#111;font-weight:700;letter-spacing:-0.2px;overflow-wrap:normal;word-break:normal";

const EMAIL_PARAGRAPH_STYLE =
  "font-size:16px;line-height:1.5;margin:0 0 16px;color:#111;overflow-wrap:break-word;word-break:normal";

const EMAIL_BUTTON_STYLE =
  "display:inline-block;margin-top:10px;background:#f6c500;color:#111;padding:12px 18px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:15px;line-height:1.2";

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
      <div style="${EMAIL_SHELL_STYLE}">
        <p style="${EMAIL_PARAGRAPH_STYLE}">${greeting}</p>
        <h1 style="${EMAIL_HEADING_STYLE}">Gracias por elegir RentoCampo</h1>
        <p style="${EMAIL_PARAGRAPH_STYLE}">Tu pago fue aprobado y el plan <strong>${escapeHtml(args.planName)}</strong> ya está activo.</p>

        <div style="margin:22px 0;padding:16px;background:#faf8f0;border-radius:12px;box-sizing:border-box">
          <p style="margin:0 0 8px;font-size:15px;line-height:1.45"><strong>Plan:</strong> ${escapeHtml(args.planName)}</p>
          <p style="margin:0 0 8px;font-size:15px;line-height:1.45"><strong>Cupo:</strong> ${publicationCopy}</p>
          <p style="margin:0 0 8px;font-size:15px;line-height:1.45"><strong>Vigencia:</strong> 12 meses</p>
          <p style="margin:0 0 8px;font-size:15px;line-height:1.45"><strong>Desde:</strong> ${formatDate(args.startsAt)}</p>
          <p style="margin:0 0 8px;font-size:15px;line-height:1.45"><strong>Hasta:</strong> ${formatDate(args.expiresAt)}</p>
          <p style="margin:0;font-size:15px;line-height:1.45"><strong>Importe abonado:</strong> ${formatMoney(args.amount, args.currency)}</p>
        </div>

        <p style="${EMAIL_PARAGRAPH_STYLE}">Ya podés empezar a usar tu cupo de publicaciones desde <strong>Mis campos</strong>.</p>
        <a href="${APP_URL}/mis-campos" style="${EMAIL_BUTTON_STYLE}">Ir a Mis campos</a>
        <p style="margin-top:26px;color:#666;font-size:13px;line-height:1.4">RentoCampo · Tierra productiva, productores y servicios rurales.</p>
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
      <div style="${EMAIL_SHELL_STYLE}">
        <p style="${EMAIL_PARAGRAPH_STYLE}">${greeting}</p>
        <h1 style="${EMAIL_HEADING_STYLE}">Completaste el cupo de tu plan</h1>
        <p style="${EMAIL_PARAGRAPH_STYLE}">El plan <strong>${escapeHtml(args.planName)}</strong> alcanzó las <strong>${args.publicationLimit} publicaciones</strong> incluidas.</p>
        <p style="${EMAIL_PARAGRAPH_STYLE}">Para publicar una nueva oportunidad, podés contratar un nuevo paquete o elegir uno con mayor capacidad.</p>
        <a href="${APP_URL}/mis-campos" style="${EMAIL_BUTTON_STYLE}">Ver paquetes disponibles</a>
        <p style="margin-top:26px;color:#666;font-size:13px;line-height:1.4">Gracias por usar RentoCampo.</p>
      </div>`,
  });

  if (error) throw new Error(error.message);
}
