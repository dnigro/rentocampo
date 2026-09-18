import { after, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendDirectMessageNotification } from "@/lib/send-message-notification";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function GET(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const interlocutorId = new URL(request.url).searchParams.get("interlocutorId");
  if (
    !interlocutorId ||
    !UUID_PATTERN.test(interlocutorId) ||
    interlocutorId === user.id
  ) {
    return NextResponse.json({ error: "Interlocutor inválido" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: mensajes, error } = await admin
    .from("mensajes_directos")
    .select("id, contenido, created_at, remitente_id, leido")
    .or(
      `and(remitente_id.eq.${user.id},destinatario_id.eq.${interlocutorId}),and(remitente_id.eq.${interlocutorId},destinatario_id.eq.${user.id})`,
    )
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error consultando mensajes directos:", error);
    return NextResponse.json(
      { error: "No se pudieron cargar los mensajes" },
      { status: 500 },
    );
  }

  const { error: readError } = await admin
    .from("mensajes_directos")
    .update({ leido: true })
    .eq("destinatario_id", user.id)
    .eq("remitente_id", interlocutorId)
    .eq("leido", false);

  if (readError) {
    console.error("Error marcando mensajes directos como leídos:", readError);
  }

  return NextResponse.json(
    { mensajes: mensajes ?? [] },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const destinatarioId = body?.destinatarioId;
  const contenido = typeof body?.contenido === "string" ? body.contenido.trim() : "";

  if (!destinatarioId || !UUID_PATTERN.test(destinatarioId) || !contenido) {
    return NextResponse.json(
      { error: "Datos de mensaje incompletos" },
      { status: 400 },
    );
  }
  if (destinatarioId === user.id) {
    return NextResponse.json(
      { error: "No podés enviarte un mensaje a vos mismo" },
      { status: 400 },
    );
  }

  const admin = createAdminClient();
  const { data: destinatario } = await admin
    .from("profiles")
    .select("id")
    .eq("id", destinatarioId)
    .maybeSingle();

  if (!destinatario) {
    return NextResponse.json(
      { error: "El destinatario no existe" },
      { status: 404 },
    );
  }

  const { data: mensaje, error } = await admin
    .from("mensajes_directos")
    .insert({
      remitente_id: user.id,
      destinatario_id: destinatarioId,
      contenido,
    })
    .select("id, contenido, created_at, remitente_id, leido")
    .single();

  if (error || !mensaje) {
    console.error("Error guardando mensaje directo:", error);
    return NextResponse.json(
      { error: error?.message ?? "No se pudo guardar el mensaje" },
      { status: 500 },
    );
  }

  after(async () => {
    try {
      await sendDirectMessageNotification(mensaje.id);
    } catch (notificationError) {
      console.error(
        "Error enviando notificación de mensaje directo:",
        notificationError,
      );
    }
  });

  return NextResponse.json({ mensaje });
}
