import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (body?.tipo !== "propietario" && body?.tipo !== "productor") {
    return NextResponse.json({ error: "Tipo de perfil inválido" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .update({ tipo: body.tipo })
    .eq("id", user.id)
    .select("tipo")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? "No se pudo actualizar el perfil" },
      { status: 500 },
    );
  }

  return NextResponse.json({ tipo: data.tipo });
}
