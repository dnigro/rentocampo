import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";

function escapeHtml(value: string | null | undefined) {
  return (value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character] ?? character);
}

async function getRecipient(
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
  profile?: { nombre?: string | null; email?: string | null } | null,
) {
  if (profile?.email) return profile;

  const { data } = await admin.auth.admin.getUserById(userId);
  return {
    nombre: profile?.nombre ?? (data.user?.user_metadata?.nombre as string | undefined),
    email: data.user?.email,
  };
}

export async function sendMessageNotification(mensajeId: string) {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    throw new Error("RESEND_API_KEY no está configurada");
  }

  const admin = createAdminClient();
  const { data: mensaje, error } = await admin
    .from("mensajes")
    .select(`
      contenido, destinatario_id,
      campo:campos(id, titulo),
      remitente:profiles!mensajes_remitente_id_fkey(nombre),
      destinatario:profiles!mensajes_destinatario_id_fkey(nombre, email)
    `)
    .eq("id", mensajeId)
    .single();

  if (error || !mensaje) {
    throw new Error(error?.message ?? "Mensaje no encontrado");
  }

  const campo = Array.isArray(mensaje.campo) ? mensaje.campo[0] : mensaje.campo;
  const remitente = Array.isArray(mensaje.remitente) ? mensaje.remitente[0] : mensaje.remitente;
  const destinatarioProfile = Array.isArray(mensaje.destinatario)
    ? mensaje.destinatario[0]
    : mensaje.destinatario;
  const destinatario = await getRecipient(
    admin,
    mensaje.destinatario_id,
    destinatarioProfile,
  );

  if (!destinatario?.email) {
    throw new Error("El destinatario no tiene email");
  }

  const origin = process.env.NEXT_PUBLIC_APP_URL;
  if (!origin) {
    throw new Error("NEXT_PUBLIC_APP_URL no está configurada");
  }

  const nombreRemitente = escapeHtml(remitente?.nombre || "Un interesado");
  const tituloCampo = escapeHtml(campo?.titulo || "tu campo");
  const contenido = escapeHtml(mensaje.contenido);
  const urlMensaje = `${origin.replace(/\/$/, "")}/mensajes/${campo?.id}`;

  const resend = new Resend(resendApiKey);
  const { error: resendError } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "RentoCampo <no-reply@rentocampo.com>",
    to: destinatario.email,
    subject: `Nuevo mensaje de ${remitente?.nombre || "un interesado"} — ${campo?.titulo || "tu campo"}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:32px;background:#fff;border:1px solid #e8e6e0;border-radius:16px">
        <h1 style="color:#2d6a2d;font-size:24px">Tenés un nuevo mensaje</h1>
        <p><strong>${nombreRemitente}</strong> se contactó por <strong>${tituloCampo}</strong>.</p>
        <blockquote style="margin:24px 0;padding:16px;border-left:3px solid #2d6a2d;background:#f7f5f0">${contenido}</blockquote>
        <a href="${urlMensaje}" style="display:inline-block;background:#2d6a2d;color:#fff;padding:13px 20px;border-radius:8px;text-decoration:none;font-weight:bold">Responder mensaje</a>
      </div>`,
  });

  if (resendError) throw new Error(resendError.message);
}

export async function sendDirectMessageNotification(mensajeId: string) {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    throw new Error("RESEND_API_KEY no está configurada");
  }

  const admin = createAdminClient();
  const { data: mensaje, error } = await admin
    .from("mensajes_directos")
    .select("contenido, remitente_id, destinatario_id")
    .eq("id", mensajeId)
    .single();

  if (error || !mensaje) {
    throw new Error(error?.message ?? "Mensaje directo no encontrado");
  }

  const { data: perfiles, error: perfilesError } = await admin
    .from("profiles")
    .select("id, nombre, email")
    .in("id", [mensaje.remitente_id, mensaje.destinatario_id]);

  if (perfilesError) throw new Error(perfilesError.message);

  const remitente = perfiles?.find((perfil) => perfil.id === mensaje.remitente_id);
  const destinatarioProfile = perfiles?.find(
    (perfil) => perfil.id === mensaje.destinatario_id,
  );
  const destinatario = await getRecipient(admin, mensaje.destinatario_id, destinatarioProfile);

  if (!destinatario?.email) {
    throw new Error("El destinatario no tiene email");
  }

  const origin = process.env.NEXT_PUBLIC_APP_URL;
  if (!origin) {
    throw new Error("NEXT_PUBLIC_APP_URL no está configurada");
  }

  const nombreRemitente = escapeHtml(remitente?.nombre || "Un prestador");
  const contenido = escapeHtml(mensaje.contenido);
  const urlMensaje = `${origin.replace(/\/$/, "")}/mensajes/direct/${mensaje.remitente_id}`;

  const resend = new Resend(resendApiKey);
  const { error: resendError } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "RentoCampo <no-reply@rentocampo.com>",
    to: destinatario.email,
    subject: `Nuevo mensaje de ${remitente?.nombre || "un usuario"} — RentoCampo`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:32px;background:#fff;border:1px solid #e8e6e0;border-radius:16px">
        <h1 style="color:#2d6a2d;font-size:24px">Tenés un nuevo mensaje</h1>
        <p><strong>${nombreRemitente}</strong> te escribió por tus servicios rurales.</p>
        <blockquote style="margin:24px 0;padding:16px;border-left:3px solid #2d6a2d;background:#f7f5f0">${contenido}</blockquote>
        <a href="${urlMensaje}" style="display:inline-block;background:#2d6a2d;color:#fff;padding:13px 20px;border-radius:8px;text-decoration:none;font-weight:bold">Responder mensaje</a>
      </div>`,
  });

  if (resendError) throw new Error(resendError.message);
}
