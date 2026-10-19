import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendMessageNotification } from "@/lib/send-message-notification";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const campoId = body?.campoId;
  const destinatarioId = body?.destinatarioId;
  const contenido = typeof body?.contenido === "string" ? body.contenido.trim() : "";
  if (!campoId || !destinatarioId || !contenido) {
    return NextResponse.json({ error: "Datos de mensaje incompletos" }, { status: 400 });
  }
  if (destinatarioId === user.id) {
    return NextResponse.json({ error: "No podés enviarte un mensaje a vos mismo" }, { status: 400 });
  }

  // Authenticated client applies participant RLS; no service-role key needed.
  const admin = supabase;
  const { data: campo, error: campoError } = await admin.from("campos")
    .select("id, propietario_id, titulo").eq("id", campoId).eq("status","activo").maybeSingle();
  if (campoError || !campo) return NextResponse.json({ error: "Campo no encontrado" }, { status: 404 });
  // DEMO examples are never real market offers, even via a direct API request.
  if (campoId.startsWith("20000000-") || /\bDEMO\b/i.test(campo.titulo ?? "")) {
    return NextResponse.json({ error: "Esta es una ficha DEMO y no recibe consultas", code:"demo_not_contactable" }, { status: 403 });
  }
  if (campo.propietario_id !== user.id && campo.propietario_id !== destinatarioId) {
    return NextResponse.json({ error: "El destinatario no participa de esta conversación" }, { status: 403 });
  }

  const { data, error } = await admin.from("mensajes").insert({
    campo_id: campoId,
    remitente_id: user.id,
    destinatario_id: destinatarioId,
    contenido,
  }).select("id, contenido, created_at, leido, remitente_id").single();
  if (error || !data) return NextResponse.json({ error: error?.message ?? "No se pudo guardar el mensaje" }, { status: 500 });

  let notificationSent = true;
  try {
    await sendMessageNotification(data.id);
  } catch (notificationError) {
    notificationSent = false;
    console.error("Error enviando notificación de mensaje:", notificationError);
  }

  return NextResponse.json({ mensaje: data, notificationSent });
}
