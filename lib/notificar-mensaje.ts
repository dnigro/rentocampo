import { Resend } from "resend";

type NotificacionMensaje = {
  campo: { id: string; titulo: string; provincia: string | null };
  contenido: string;
  destinatario: { email: string; nombre: string | null };
  remitente: { nombre: string | null };
  origin: string;
};

function escaparHtml(valor: string) {
  return valor.replace(/[&<>'"]/g, (caracter) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  })[caracter] ?? caracter);
}

export async function notificarMensaje({
  campo,
  contenido,
  destinatario,
  remitente,
  origin,
}: NotificacionMensaje) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !destinatario.email) return;

  const nombreRemitente = escaparHtml(remitente.nombre ?? "Un usuario");
  const tituloCampo = escaparHtml(campo.titulo);
  const mensaje = escaparHtml(contenido);
  const urlMensaje = `${origin}/mensajes/${campo.id}`;

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: "RentoCampo <noreply@rentocampo.com>",
    to: destinatario.email,
    subject: "RentoCampo | Nuevo mensaje sobre tu campo",
    html: `<!doctype html><html lang="es"><body style="font-family:Arial,sans-serif;color:#1a3a1a"><h1>Tenés un nuevo mensaje</h1><p><strong>${nombreRemitente}</strong> te escribió sobre <strong>${tituloCampo}</strong>.</p><blockquote style="border-left:3px solid #2d6a2d;margin:20px 0;padding-left:16px">${mensaje}</blockquote><p><a href="${urlMensaje}">Responder mensaje</a></p><p style="color:#666;font-size:12px">Recibís este correo porque tenés una cuenta en RentoCampo.</p></body></html>`,
  });

  if (error) throw new Error(error.message);
}
