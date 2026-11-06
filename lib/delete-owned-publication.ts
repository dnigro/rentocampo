import type { SupabaseClient } from "@supabase/supabase-js";

/** RLS and the explicit owner predicate must both allow the deletion. */
export async function deleteOwnedPublication(client: SupabaseClient, table: "campos" | "servicios_publicaciones", id: string) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return Response.json({ error: "Publicación inválida." }, { status: 400 });
  }
  try {
    const { data: { user }, error: authError } = await client.auth.getUser();
    if (authError || !user) return Response.json({ error: "Iniciá sesión para eliminar." }, { status: 401 });
    const { data, error } = await client.from(table).delete()
      .eq("id", id).eq("propietario_id", user.id).select("id").maybeSingle();
    if (error) {
      console.error("Error eliminando publicación", { table, code: error.code });
      return Response.json({ error: "No se pudo eliminar la publicación. Intentá nuevamente." }, { status: error.code === "23503" ? 409 : 500 });
    }
    if (!data) return Response.json({ error: "Publicación no encontrada o sin permiso." }, { status: 404 });
    return Response.json({ ok: true, id: data.id });
  } catch {
    return Response.json({ error: "No se pudo completar la eliminación. Intentá nuevamente." }, { status: 500 });
  }
}
