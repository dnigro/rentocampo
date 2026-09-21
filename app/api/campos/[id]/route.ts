import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRole) {
    return NextResponse.json(
      { error: "Servidor no configurado" },
      { status: 503 },
    );
  }

  const admin = createAdminClient(url, serviceRole, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: campo } = await admin
    .from("campos")
    .select("id, propietario_id")
    .eq("id", id)
    .maybeSingle();

  if (!campo || campo.propietario_id !== user.id) {
    return NextResponse.json({ error: "Campo no encontrado" }, { status: 404 });
  }

  const { error } = await admin
    .from("campos")
    .delete()
    .eq("id", id)
    .eq("propietario_id", user.id);

  if (error) {
    return NextResponse.json(
      { error: "No se pudo eliminar el campo." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
