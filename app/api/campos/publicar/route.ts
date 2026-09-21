import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import {
  consumeLandPublicationQuota,
  getLandQuotaStatus,
} from "@/lib/billing/land-quota";

const ALLOWED_FIELDS = [
  "country_code",
  "titulo",
  "descripcion",
  "ubicacion",
  "provincia",
  "departamento",
  "localidad",
  "hectareas",
  "aptitud",
  "ambiente",
  "precio",
  "moneda",
  "disponibilidad",
  "rendimiento_estimado",
  "mejoras",
  "latitud",
  "longitud",
] as const;

function sanitizeCampo(input: Record<string, unknown>) {
  const result: Record<string, unknown> = {};
  for (const field of ALLOWED_FIELDS) {
    if (field in input) result[field] = input[field];
  }
  return result;
}

async function getContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "No autenticado", status: 401 as const };

  const { data: profile } = await supabase
    .from("profiles")
    .select("roles")
    .eq("id", user.id)
    .single();

  if (!profile?.roles?.includes("propietario")) {
    return {
      error:
        "Solo los propietarios pueden publicar o administrar campos. Activá el rol Propietario desde tu perfil.",
      status: 403 as const,
    };
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRole) {
    return { error: "Servidor no configurado", status: 503 as const };
  }

  const admin = createAdminClient(url, serviceRole, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  return { user, admin };
}

export async function POST(request: Request) {
  const context = await getContext();
  if ("error" in context) {
    return NextResponse.json({ error: context.error }, { status: context.status });
  }

  const body = await request.json().catch(() => null);
  const estado = body?.estado === "activo" ? "activo" : "borrador";
  const form =
    body?.form && typeof body.form === "object"
      ? sanitizeCampo(body.form as Record<string, unknown>)
      : null;

  if (!form) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  if (estado === "activo") {
    const quota = await getLandQuotaStatus(context.user.id);
    if (!quota.canPublish) {
      return NextResponse.json(
        {
          error:
            "Ya utilizaste todas las publicaciones de tu plan. Elegí un plan superior para publicar una nueva tierra.",
          code: "quota_exhausted",
          quota,
        },
        { status: 409 },
      );
    }
  }

  const { data: campo, error: insertError } = await context.admin
    .from("campos")
    .insert({
      ...form,
      propietario_id: context.user.id,
      status: estado,
    })
    .select("id")
    .single();

  if (insertError || !campo) {
    return NextResponse.json(
      { error: insertError?.message ?? "No se pudo crear el campo" },
      { status: 500 },
    );
  }

  if (estado === "activo") {
    const consumed = await consumeLandPublicationQuota({
      userId: context.user.id,
      campoId: campo.id,
    });

    if (!consumed.ok) {
      await context.admin.from("campos").delete().eq("id", campo.id);
      return NextResponse.json(
        {
          error:
            "No se pudo reservar el cupo de publicación. No se guardó el campo.",
          code: consumed.code,
        },
        { status: consumed.code === "quota_exhausted" ? 409 : 500 },
      );
    }
  }

  return NextResponse.json({ id: campo.id });
}

export async function PATCH(request: Request) {
  const context = await getContext();
  if ("error" in context) {
    return NextResponse.json({ error: context.error }, { status: context.status });
  }

  const body = await request.json().catch(() => null);
  const campoId = typeof body?.campoId === "string" ? body.campoId : "";
  const estado = body?.estado === "activo" ? "activo" : "borrador";
  const form =
    body?.form && typeof body.form === "object"
      ? sanitizeCampo(body.form as Record<string, unknown>)
      : null;

  if (!campoId || !form) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const { data: existing } = await context.admin
    .from("campos")
    .select("id, status")
    .eq("id", campoId)
    .eq("propietario_id", context.user.id)
    .maybeSingle();

  if (!existing) {
    return NextResponse.json({ error: "Campo no encontrado" }, { status: 404 });
  }

  if (estado === "activo" && existing.status !== "activo") {
    const quota = await getLandQuotaStatus(context.user.id);
    if (!quota.canPublish) {
      return NextResponse.json(
        {
          error:
            "Ya utilizaste todas las publicaciones de tu plan. Elegí un plan superior para publicar una nueva tierra.",
          code: "quota_exhausted",
          quota,
        },
        { status: 409 },
      );
    }
  }

  const { error: updateError } = await context.admin
    .from("campos")
    .update({ ...form, status: estado })
    .eq("id", campoId)
    .eq("propietario_id", context.user.id);

  if (updateError) {
    return NextResponse.json(
      { error: updateError.message ?? "No se pudo actualizar el campo" },
      { status: 500 },
    );
  }

  if (estado === "activo") {
    const consumed = await consumeLandPublicationQuota({
      userId: context.user.id,
      campoId,
    });

    if (!consumed.ok) {
      await context.admin
        .from("campos")
        .update({ status: existing.status })
        .eq("id", campoId);

      return NextResponse.json(
        {
          error:
            "No se pudo reservar el cupo de publicación. El campo no quedó publicado.",
          code: consumed.code,
        },
        { status: consumed.code === "quota_exhausted" ? 409 : 500 },
      );
    }
  }

  return NextResponse.json({ id: campoId });
}
