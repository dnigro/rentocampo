import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

async function removeFolder(
  admin: ReturnType<typeof createAdminClient>,
  bucket: string,
  folder: string,
) {
  const { data, error } = await admin.storage.from(bucket).list(folder, {
    limit: 1000,
  });
  if (error) throw error;
  if (!data?.length) return;

  const paths = data.map((item) => `${folder}/${item.name}`);
  const { error: removeError } = await admin.storage.from(bucket).remove(paths);
  if (removeError) throw removeError;
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (body?.confirmation !== "ELIMINAR") {
    return NextResponse.json({ error: "Confirmación inválida" }, { status: 400 });
  }

  try {
    const admin = createAdminClient();
    const { data: campos, error: camposError } = await admin
      .from("campos")
      .select("id")
      .eq("propietario_id", user.id);
    if (camposError) throw camposError;

    await removeFolder(admin, "avatars", user.id);
    await Promise.all(
      (campos ?? []).map((campo) =>
        removeFolder(admin, "campos-fotos", campo.id),
      ),
    );

    const { error } = await supabase.rpc("delete_own_account", {
      confirmation: body.confirmation,
    });
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[api/account] account deletion failed", {
      userId: user.id,
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: "No se pudo eliminar la cuenta" },
      { status: 500 },
    );
  }
}
