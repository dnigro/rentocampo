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
  const file = formData.get("file");

  if (typeof campoId !== "string" || !(file instanceof File)) {
    return NextResponse.json({ error: "Foto o campo inválidos" }, { status: 400 });
  }
  if (!file.type.startsWith("image/") || file.size > MAX_FOTO_BYTES) {
    return NextResponse.json({ error: "La foto debe ser una imagen de hasta 8 MB" }, { status: 400 });
  }

  const { data: campo, error: campoError } = await supabase
    .from("campos")
    .select("id")
    .eq("id", campoId)
    .eq("propietario_id", user.id)
    .maybeSingle();
  if (campoError || !campo) {
    return NextResponse.json({ error: "No tenés permiso para agregar fotos a este campo" }, { status: 403 });
  }

  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${campoId}/${crypto.randomUUID()}.${extension}`;
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

  return NextResponse.json({ url: publicUrl });
}
