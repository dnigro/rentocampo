import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

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

  const admin = createAdminClient();
  const { data: campo, error: campoError } = await admin.from("campos")
    .select("id, propietario_id").eq("id", campoId).maybeSingle();
  if (campoError || !campo) return NextResponse.json({ error: "Campo no encontrado" }, { status: 404 });
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

  return NextResponse.json({ mensaje: data });
}
