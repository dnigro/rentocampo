import { createClient } from "@/lib/supabase/server";
import { deleteOwnedPublication } from "@/lib/delete-owned-publication";
import { revalidatePath } from "next/cache";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return Response.json({ error: "Origen inválido." }, { status: 403 });
  }
  const { id } = await params;
  const result = await deleteOwnedPublication(await createClient(), "servicios_publicaciones", id);
  if (result.ok) {
    revalidatePath("/mis-servicios-rurales");
    revalidatePath("/servicios-rurales");
    revalidatePath("/servicios-rurales/" + id);
    revalidatePath("/dashboard");
    revalidatePath("/favoritos");
    revalidatePath("/lite", "layout");
  }
  return result;
}
