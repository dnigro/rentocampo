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
    subject: "Tu plan de RentoCampo venció",
    heading: "Tu plan venció",
    detail: "Podés renovarlo desde Mis campos para volver a publicar nuevas oportunidades.",
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
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:32px;background:#fff;border:1px solid #e8e6e0;border-radius:16px;color:#111">
        <p>${greeting}</p>
        <h1 style="font-size:26px;margin:14px 0;color:#111">${copy.heading}</h1>
        <p>Tu plan <strong>${escapeHtml(args.planName)}</strong> tiene fecha de vencimiento el <strong>${expiryLabel}</strong>.</p>
        <p>${copy.detail}</p>
        <a href="${appUrl}/mis-campos" style="display:inline-block;margin-top:14px;background:#f6c500;color:#111;padding:13px 20px;border-radius:8px;text-decoration:none;font-weight:bold">Ver y renovar mi plan</a>
        <p style="margin-top:28px;color:#666;font-size:13px">RentoCampo · Tierra productiva, productores y servicios rurales.</p>
      </div>`,
  });

  if (error) throw new Error(error.message);
}
