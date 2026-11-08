import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function PATCH(request: Request) {
  const client = await createClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { data: profile, error: profileError } = await client.from("profiles")
    .select("activo").eq("id", user.id).maybeSingle();
  if (profileError || profile?.activo !== true) {
    return NextResponse.json({ error: "La cuenta está desactivada o no disponible" }, { status: 403 });
  }

  const payload = await request.json().catch(() => null);
  if (typeof payload?.id !== "string" || !UUID.test(payload.id) ||
      typeof payload?.activo !== "boolean") {
    return NextResponse.json({ error: "Estado de servicio inválido" }, { status: 400 });
  }

  const { data, error } = await createAdminClient()
    .from("servicios_publicaciones")
    .update({ activo: payload.activo })
    .eq("id", payload.id)
    .eq("propietario_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) return NextResponse.json({ error: "No se pudo cambiar el estado" }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 });
  return NextResponse.json({ ok: true, activo: payload.activo });
}
