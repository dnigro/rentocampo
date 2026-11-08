import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { consumeLandPublicationQuota, getLandQuotaStatus } from "@/lib/billing/land-quota";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function PATCH(request: Request) {
  const client = await createClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const payload = await request.json().catch(() => null);
  const id = payload?.id;
  const status = payload?.status;
  if (typeof id !== "string" || !UUID.test(id) ||
      (status !== "activo" && status !== "pausado")) {
    return NextResponse.json({ error: "Estado de publicación inválido" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: actual, error: readError } = await admin
    .from("campos").select("id, status")
    .eq("id", id).eq("propietario_id", user.id).maybeSingle();
  if (readError) return NextResponse.json({ error: "No se pudo consultar el campo" }, { status: 500 });
  if (!actual) return NextResponse.json({ error: "Campo no encontrado" }, { status: 404 });

  if (actual.status === status) return NextResponse.json({ ok: true, status });
  if (status === "activo") {
    const cuota = await getLandQuotaStatus(user.id);
    if (!cuota.canPublish) {
      return NextResponse.json({ error: "No tenés cupos disponibles", code: "quota_exhausted" }, { status: 409 });
    }
  }

  const { error: updateError } = await admin
    .from("campos").update({ status })
    .eq("id", id).eq("propietario_id", user.id);
  if (updateError) return NextResponse.json({ error: "No se pudo actualizar el estado" }, { status: 500 });

  if (status === "activo") {
    const reservation = await consumeLandPublicationQuota({ userId: user.id, campoId: id });
    if (!reservation.ok) {
      await admin.from("campos").update({ status: actual.status })
        .eq("id", id).eq("propietario_id", user.id);
      return NextResponse.json({ error: "No se pudo reservar el cupo", code: reservation.code }, { status: 409 });
    }
  }
  return NextResponse.json({ ok: true, status });
}
