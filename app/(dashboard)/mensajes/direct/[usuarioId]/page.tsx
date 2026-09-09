import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import MensajeHilo from "@/components/mensajes/MensajeHilo";
import "@/styles/mensajes.css";

export default async function MensajeDirectoPage({ params }: { params: Promise<{ usuarioId: string }> }) {
  const { usuarioId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (user.id === usuarioId) notFound();

  const admin = createAdminClient();
  const { data: contacto } = await admin
    .from("profiles")
    .select("id, nombre, avatar_url")
    .eq("id", usuarioId)
    .maybeSingle();
  if (!contacto) notFound();

  const { data: mensajes } = await supabase.from("mensajes").select(
    "id, contenido, created_at, leido, remitente_id, remitente:profiles!mensajes_remitente_id_fkey(id, nombre, avatar_url)",
  ).is("campo_id", null).or(
    `and(remitente_id.eq.${user.id},destinatario_id.eq.${usuarioId}),and(remitente_id.eq.${usuarioId},destinatario_id.eq.${user.id})`,
  ).order("created_at", { ascending: true });

  await supabase.from("mensajes").update({ leido: true }).is("campo_id", null)
    .eq("remitente_id", usuarioId).eq("destinatario_id", user.id).eq("leido", false);

  const mensajesIniciales = (mensajes ?? []).map((mensaje) => ({
    ...mensaje,
    remitente: Array.isArray(mensaje.remitente) ? mensaje.remitente[0] : mensaje.remitente,
  }));

  return <div className="page-container">
    <div className="hilo-header"><Link href="/mensajes" className="hilo-back">← Mensajes</Link>
      <div className="hilo-header-info"><div className="hilo-header-avatar">{contacto.avatar_url ? <img src={contacto.avatar_url} alt={contacto.nombre} /> : <span>{contacto.nombre?.[0]?.toUpperCase()}</span>}</div><p className="hilo-header-nombre">{contacto.nombre}</p></div>
    </div>
    <MensajeHilo userId={user.id} destinatarioId={usuarioId} mensajesIniciales={mensajesIniciales} />
  </div>;
}
