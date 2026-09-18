import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isMissingMensajesDirectosLeido } from "@/lib/supabase/mensajes-directos";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const admin = createAdminClient();
  const [mensajesResult, directosResult] = await Promise.all([
    admin
      .from("mensajes")
      .select("id", { count: "exact", head: true })
      .eq("destinatario_id", user.id)
      .eq("leido", false),
    admin
      .from("mensajes_directos")
      .select("id", { count: "exact", head: true })
      .eq("destinatario_id", user.id)
      .eq("leido", false),
  ]);

  if (mensajesResult.error) {
    console.error("Error contando mensajes no leídos:", {
      mensajes: mensajesResult.error,
      directos: directosResult.error,
    });
    return NextResponse.json(
      { error: "No se pudieron contar los mensajes" },
      { status: 500 },
    );
  }

  const directosPendientesDeMigracion = isMissingMensajesDirectosLeido(
    directosResult.error,
  );
  if (directosResult.error && !directosPendientesDeMigracion) {
    console.error("Error contando mensajes directos no leídos:", directosResult.error);
    return NextResponse.json(
      { error: "No se pudieron contar los mensajes" },
      { status: 500 },
    );
  }

  return NextResponse.json(
    {
      total:
        (mensajesResult.count ?? 0) +
        (directosPendientesDeMigracion ? 0 : (directosResult.count ?? 0)),
      directosPendientesDeMigracion,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
