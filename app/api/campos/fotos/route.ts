import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const MAX_FOTO_BYTES = 8 * 1024 * 1024;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const formData = await request.formData();
  const campoId = formData.get("campoId");
  const orden = Number(formData.get("orden"));
  const file = formData.get("file");

  if (typeof campoId !== "string" || !Number.isInteger(orden) || orden < 0 || !(file instanceof File)) {
    return NextResponse.json({ error: "Foto o campo inválidos" }, { status: 400 });
  }
  if (!file.type.startsWith("image/") || file.size > MAX_FOTO_BYTES) {
    return NextResponse.json({ error: "La foto debe ser una imagen de hasta 8 MB" }, { status: 400 });
  }

  const { data: campo, error: campoError } = await supabase
    .from("campos")
    .select("id, propietario_id")
    .eq("id", campoId)
    .eq("propietario_id", user.id)
    .maybeSingle();
  if (campoError || !campo) {
    return NextResponse.json({ error: "No tenés permiso para agregar fotos a este campo" }, { status: 403 });
  }

  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${campo.propietario_id}/${crypto.randomUUID()}.${extension}`;
  const admin = createAdminClient();
  const { error: uploadError } = await admin.storage
    .from("campos-fotos")
    .upload(path, file, { contentType: file.type, upsert: false });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const {
    data: { publicUrl },
  } = admin.storage.from("campos-fotos").getPublicUrl(path);
  const { error: photoError } = await admin
    .from("campos_fotos")
    .insert({
      campo_id: campoId,
      propietario_id: campo.propietario_id,
      storage_path: path,
      url: publicUrl,
      orden,
    });

  if (photoError) {
    await admin.storage.from("campos-fotos").remove([path]);
    return NextResponse.json({ error: photoError.message }, { status: 500 });
  }

  return NextResponse.json({ url: publicUrl, orden });
}

/** Synchronize the final photo selection after new uploads have completed. */
export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  let payload: { campoId?: string; fotos?: { id: string; orden: number }[] };
  try { payload = await request.json(); }
  catch { return NextResponse.json({ error: "Datos inválidos" }, { status: 400 }); }
  const { campoId, fotos } = payload;
  if (!campoId || !Array.isArray(fotos) || fotos.length > 8 ||
      fotos.some((f) => !f || typeof f.id !== "string" || !Number.isInteger(f.orden) || f.orden < 0 || f.orden >= fotos.length) ||
      new Set(fotos.map(f => f.id)).size !== fotos.length ||
      new Set(fotos.map(f => f.orden)).size !== fotos.length) {
    return NextResponse.json({ error: "Selección de fotos inválida" }, { status: 400 });
  }
  const { data: campo } = await supabase.from("campos").select("id")
    .eq("id", campoId).eq("propietario_id", user.id).maybeSingle();
  if (!campo) return NextResponse.json({ error: "Sin permiso" }, { status: 403 });

  const admin = createAdminClient();
  const { data: existentes, error: readError } = await admin.from("campos_fotos")
    .select("id").eq("campo_id", campoId).eq("propietario_id", user.id);
  if (readError) return NextResponse.json({ error: readError.message }, { status: 500 });
  const actualIds = new Set((existentes ?? []).map(f => f.id));
  if (fotos.some(f => !actualIds.has(f.id))) {
    return NextResponse.json({ error: "La selección incluye fotos ajenas al campo" }, { status: 400 });
  }
  // Update ordering before removing unselected rows. Keep storage objects intact
  // to avoid irreversible deletion if a database operation fails.
  for (const foto of fotos) {
    const { error } = await admin.from("campos_fotos").update({ orden: foto.orden })
      .eq("id", foto.id).eq("campo_id", campoId).eq("propietario_id", user.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }
  const removed = [...actualIds].filter(id => !fotos.some(f => f.id === id));
  if (removed.length) {
    const { error } = await admin.from("campos_fotos").delete().eq("campo_id", campoId)
      .eq("propietario_id", user.id).in("id", removed);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
