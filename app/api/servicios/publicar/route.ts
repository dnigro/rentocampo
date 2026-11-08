import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isCountryCode } from "@/data/countries";
import { SERVICIOS_RURALES } from "@/data/servicios-rurales";
import { errorServicioPublico } from "@/lib/publication-content-guard";

const validServices = SERVICIOS_RURALES.map(({ value }) => value);

async function contexto() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null };
  // A disabled account may stay signed in; enforce moderator status on writes.
  const { data: profile, error } = await supabase.from("profiles")
    .select("activo").eq("id", user.id).maybeSingle();
  if (error || profile?.activo !== true) return { user: null };
  return { user };
}

function validarInput(raw: unknown) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { error: "Información de servicio inválida." };
  }
  const data = raw as Record<string, unknown>;
  if (!isCountryCode(data.country_code)) {
    return { error: "Seleccioná un país válido." };
  }
  const error = errorServicioPublico(data, validServices);
  if (error) return { error };

  const fotos = data.fotos_urls as string[];
  return { payload: {
    country_code: data.country_code,
    servicios_rurales: data.servicios_rurales as string[],
    nombre_comercial: (data.nombre_comercial as string).trim(),
    foto_url: fotos[0],
    fotos_urls: fotos,
    zona: typeof data.zona === "string" ? data.zona.trim() || null : null,
    provincia: (data.provincia as string).trim(),
    localidad: typeof data.localidad === "string" ? data.localidad.trim() || null : null,
    latitud: data.latitud as number,
    longitud: data.longitud as number,
    detalle: typeof data.detalle === "string" ? data.detalle.trim() || null : null,
  }};
}

export async function POST(request: Request) {
  const { user } = await contexto();
  if (!user) return NextResponse.json({ error: "Iniciá sesión para publicar." }, { status: 401 });
  const input = await request.json().catch(() => null);
  const result = validarInput(input);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });
  const { error } = await createAdminClient().from("servicios_publicaciones")
    .insert({ ...result.payload, propietario_id: user.id });
  if (error) return NextResponse.json({ error: "No se pudo guardar el servicio." }, { status: 400 });
  return NextResponse.json({ ok: true }, { status: 201 });
}

export async function PATCH(request: Request) {
  const { user } = await contexto();
  if (!user) return NextResponse.json({ error: "Iniciá sesión para editar." }, { status: 401 });
  const body = await request.json().catch(() => null);
  const id = typeof body?.id === "string" && /^[0-9a-f-]{36}$/i.test(body.id) ? body.id : null;
  if (!id) return NextResponse.json({ error: "Publicación inválida." }, { status: 400 });
  const result = validarInput(body.form);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });
  const { data, error } = await createAdminClient().from("servicios_publicaciones")
    .update(result.payload)
    .eq("id", id)
    .eq("propietario_id", user.id)
    .select("id").maybeSingle();
  if (error) return NextResponse.json({ error: "No se pudo actualizar el servicio." }, { status: 400 });
  if (!data) return NextResponse.json({ error: "Publicación no encontrada o sin permiso." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
