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
  const requestedRoles = Array.isArray(body.roles)
    ? body.roles.filter((role: unknown): role is string =>
        typeof role === "string" && ["productor", "propietario", "prestador"].includes(role),
      )
    : [];

  if (requestedRoles.length === 0) {
    return NextResponse.json({ error: "Elegí al menos un perfil" }, { status: 400 });
  }

  const profileUpdate: Record<string, unknown> = {
    roles: requestedRoles,
    nombre: typeof body.nombre === "string" ? body.nombre : "",
    telefono: typeof body.telefono === "string" ? body.telefono : "",
    bio: typeof body.bio === "string" ? body.bio : "",
    country_code: body.country_code === "AR" ? "AR" : "AR",
  };

  if (requestedRoles.includes("prestador")) {
    profileUpdate.servicios_rurales = Array.isArray(body.servicios_rurales) ? body.servicios_rurales : [];
    profileUpdate.zona_servicio = typeof body.zona_servicio === "string" ? body.zona_servicio : null;
    profileUpdate.provincia_servicio = typeof body.provincia_servicio === "string" ? body.provincia_servicio : null;
    profileUpdate.localidad_servicio = typeof body.localidad_servicio === "string" ? body.localidad_servicio : null;
  }

  const { data, error } = await admin
    .from("profiles")
    .update(profileUpdate)
    .eq("id", user.id)
    .select("id, roles")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? "No se pudo actualizar el perfil" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
