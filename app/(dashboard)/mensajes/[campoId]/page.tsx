import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import MensajeHilo from "@/components/mensajes/MensajeHilo";
import "@/styles/mensajes.css";

export default async function HiloCampoPage({
  params,
}: {
  params: Promise<{ campoId: string }>;
}) {
  const { campoId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Verificar que el usuario participa en este hilo
  const { data: campo } = await supabase
    .from("campos")
    .select("id, titulo, provincia, propietario_id")
    .eq("id", campoId)
    .single();

  if (!campo) notFound();

  const { data: mensajes } = await supabase
    .from("mensajes")
    .select(
      `
      id,
      contenido,
      created_at,
      leido,
      remitente_id,
      remitente:profiles!mensajes_remitente_id_fkey(id, nombre, avatar_url)
    `,
    )
    .eq("campo_id", campoId)
    .or(`remitente_id.eq.${user.id},destinatario_id.eq.${user.id}`)
    .order("created_at", { ascending: true });

  // Determinar el interlocutor
  const otroId =
    campo.propietario_id === user.id
      ? mensajes?.[0]?.remitente_id
      : campo.propietario_id;

  const { data: otroUsuario } = await supabase
    .from("profiles")
    .select("id, nombre, avatar_url, tipo")
    .eq("id", otroId ?? "")
    .single();

  // Marcar como leídos los mensajes dirigidos al usuario
  await supabase
    .from("mensajes")
    .update({ leido: true })
    .eq("campo_id", campoId)
    .eq("destinatario_id", user.id)
    .eq("leido", false);

  const mensajesFormateados =
    mensajes?.map((m) => ({
      ...m,
      remitente: Array.isArray(m.remitente) ? m.remitente[0] : m.remitente,
    })) ?? [];

  return (
    <div className="page-container">
      {/* Header del hilo */}
      <div className="hilo-header">
        <Link href="/mensajes" className="hilo-back">
          ← Mensajes
        </Link>
        <div className="hilo-header-info">
          <div className="hilo-header-avatar">
            {otroUsuario?.avatar_url ? (
              <img src={otroUsuario.avatar_url} alt={otroUsuario.nombre} />
            ) : (
              <span>{otroUsuario?.nombre?.[0]?.toUpperCase()}</span>
            )}
          </div>
          <div>
            <p className="hilo-header-nombre">{otroUsuario?.nombre}</p>
            <Link href={`/campos/${campo.id}`} className="hilo-header-campo">
              {campo.titulo} — {campo.provincia}
            </Link>
          </div>
        </div>
      </div>

      <MensajeHilo
        campoId={campoId}
        userId={user.id}
        destinatarioId={otroId ?? ""}
        mensajesIniciales={mensajesFormateados}
      />
    </div>
  );
}
