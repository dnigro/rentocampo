import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function GET(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  const campoId = new URL(request.url).searchParams.get("campoId");
  if (!campoId) return NextResponse.json({ error: "campoId requerido" }, { status: 400 });

  const { data, error } = await createAdminClient().from("favoritos")
    .select("campo_id").eq("campo_id", campoId).eq("usuario_id", user.id).maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ esFavorito: Boolean(data) });
}

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  const campoId = (await request.json().catch(() => null))?.campoId;
  if (!campoId) return NextResponse.json({ error: "campoId requerido" }, { status: 400 });

  const admin = createAdminClient();
  const { data: campo, error: campoError } = await admin.from("campos")
    .select("id").eq("id", campoId).eq("status", "activo").maybeSingle();
  if (campoError || !campo) return NextResponse.json({ error: "Campo no disponible" }, { status: 404 });

  const { error } = await admin.from("favoritos").upsert(
    { campo_id: campoId, usuario_id: user.id }, { onConflict: "usuario_id,campo_id" },
  );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ esFavorito: true });
}

export async function DELETE(request: Request) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  const campoId = new URL(request.url).searchParams.get("campoId");
  if (!campoId) return NextResponse.json({ error: "campoId requerido" }, { status: 400 });

  const { error } = await createAdminClient().from("favoritos")
    .delete().eq("campo_id", campoId).eq("usuario_id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ esFavorito: false });
}
