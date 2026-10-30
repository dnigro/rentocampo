import { isCountryCode } from "@/data/countries";
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

  if (!isCountryCode(body.country_code)) {
    return NextResponse.json({ error: "País inválido" }, { status: 400 });
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
    country_code: body.country_code,
  };

  // Los datos específicos del prestador se editan al publicar servicios.
  // Cambiar el rol o guardar datos personales nunca debe borrar esos valores.
  if (requestedRoles.includes("prestador")) {
    if ("servicios_rurales" in body) {
      profileUpdate.servicios_rurales = Array.isArray(body.servicios_rurales) ? body.servicios_rurales : [];
    }
    for (const field of ["zona_servicio", "provincia_servicio", "localidad_servicio"] as const) {
      if (field in body) {
        profileUpdate[field] = typeof body[field] === "string" ? body[field] : null;
      }
    }
  }

  if (body.remove_avatar === true) profileUpdate.avatar_url = null;
  if (body.remove_service_photo === true && requestedRoles.includes("prestador")) {
    profileUpdate.service_photo_url = null;
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
