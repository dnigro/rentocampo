import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Datos de perfil inválidos" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .update({
      nombre: typeof body.nombre === "string" ? body.nombre : "",
      telefono: typeof body.telefono === "string" ? body.telefono : "",
      bio: typeof body.bio === "string" ? body.bio : "",
      servicios_rurales: Array.isArray(body.servicios_rurales) ? body.servicios_rurales : [],
      zona_servicio: typeof body.zona_servicio === "string" ? body.zona_servicio : null,
      provincia_servicio: typeof body.provincia_servicio === "string" ? body.provincia_servicio : null,
      localidad_servicio: typeof body.localidad_servicio === "string" ? body.localidad_servicio : null,
      country_code: body.country_code === "AR" ? "AR" : "AR",
    })
    .eq("id", user.id)
    .select("id")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? "No se pudo actualizar el perfil" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
