import { Resend } from "resend";
import type { PlanExpiryStage } from "@/lib/billing/plan-expiry";

const COPY: Record<PlanExpiryStage, { subject: string; heading: string; detail: string }> = {
  "30d": {
    subject: "Tu plan de RentoCampo vence en 30 días",
    heading: "Tu plan vence en 30 días",
    detail: "Renovalo con tiempo para mantener disponible tu cupo de publicaciones.",
  },
  "7d": {
    subject: "Tu plan de RentoCampo vence en 7 días",
    heading: "Tu plan vence en 7 días",
    detail: "Renovalo para seguir publicando nuevas oportunidades sin interrupciones.",
  },
  "1d": {
    subject: "Tu plan de RentoCampo vence mañana",
    heading: "Tu plan vence mañana",
    detail: "Renovalo hoy para conservar tu cupo de publicaciones.",
  },
  expired: {
    subject: "Tu plan de RentoCampo finalizó",
    heading: "Tu plan finalizó",
    detail:
      "La vigencia de tu plan terminó. Podés contratar un nuevo paquete o elegir uno con mayor capacidad desde Mis campos.",
  },
};

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character] ?? character);
}

const EMAIL_SHELL_STYLE =
  "font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px 20px;background:#fff;border:1px solid #e8e6e0;border-radius:16px;color:#111;box-sizing:border-box;overflow-wrap:break-word;word-break:normal";

const EMAIL_HEADING_STYLE =
  "font-size:22px;line-height:1.15;margin:14px 0 18px;color:#111;font-weight:700;letter-spacing:-0.2px;overflow-wrap:normal;word-break:normal";

const EMAIL_PARAGRAPH_STYLE =
  "font-size:16px;line-height:1.5;margin:0 0 16px;color:#111;overflow-wrap:break-word;word-break:normal";

const EMAIL_BUTTON_STYLE =
  "display:inline-block;margin-top:10px;background:#f6c500;color:#111;padding:12px 18px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:15px;line-height:1.2";

export async function sendPlanExpiryNotification(args: {
  email: string;
  name?: string | null;
  planName: string;
  expiresAt: string;
  stage: PlanExpiryStage;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY no está configurada");

  const copy = COPY[args.stage];
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "https://rentocampo.com").replace(/\/$/, "");
  const expiryLabel = new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(new Date(args.expiresAt));
  const greeting = args.name ? `Hola ${escapeHtml(args.name)},` : "Hola,";

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "RentoCampo <no-reply@rentocampo.com>",
    to: args.email,
    subject: copy.subject,
    html: `
      <div style="${EMAIL_SHELL_STYLE}">
        <p style="${EMAIL_PARAGRAPH_STYLE}">${greeting}</p>
        <h1 style="${EMAIL_HEADING_STYLE}">${copy.heading}</h1>
        <p style="${EMAIL_PARAGRAPH_STYLE}">Tu plan <strong>${escapeHtml(args.planName)}</strong> tiene fecha de vencimiento el <strong>${expiryLabel}</strong>.</p>
        <p style="${EMAIL_PARAGRAPH_STYLE}">${copy.detail}</p>
        <a href="${appUrl}/mis-campos" style="${EMAIL_BUTTON_STYLE}">Ver y renovar mi plan</a>
        <p style="margin-top:26px;color:#666;font-size:13px;line-height:1.4">RentoCampo · Tierra productiva, productores y servicios rurales.</p>
      </div>`,
  });

  if (error) throw new Error(error.message);
}
