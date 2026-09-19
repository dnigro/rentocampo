import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import MensajeDirectoHilo from "@/components/mensajes/MensajeDirectoHilo";
import { isMissingMensajesDirectosLeido } from "@/lib/supabase/mensajes-directos";
import "@/styles/mensajes.css";

export default async function MensajeDirectoPage({ params }: { params: Promise<{ usuarioId: string }> }) {
  const { usuarioId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (user.id === usuarioId) redirect("/campos/mapa");

  const admin = createAdminClient();
  const { data: contacto } = await admin
    .from("profiles")
    .select("id, nombre, avatar_url")
    .eq("id", usuarioId)
    .maybeSingle();
  if (!contacto) notFound();

  const { data: mensajes } = await supabase.from("mensajes_directos")
    .select("id, contenido, created_at, remitente_id")
    .or(`and(remitente_id.eq.${user.id},destinatario_id.eq.${usuarioId}),and(remitente_id.eq.${usuarioId},destinatario_id.eq.${user.id})`)
    .order("created_at", { ascending: true });

  const { error: readError } = await supabase
    .from("mensajes_directos")
    .update({ leido: true })
    .eq("destinatario_id", user.id)
    .eq("remitente_id", usuarioId)
    .eq("leido", false);

  if (readError && !isMissingMensajesDirectosLeido(readError)) {
    console.error("Error marcando mensajes directos como leídos:", readError);
  }

  const mensajesIniciales = mensajes ?? [];

  return <div className="page-container">
    <div className="hilo-header"><Link href="/mensajes" className="hilo-back">← Mensajes</Link>
      <div className="hilo-header-info"><div className="hilo-header-avatar">{contacto.avatar_url ? <Image src={contacto.avatar_url} alt={contacto.nombre} width={40} height={40} /> : <span>{contacto.nombre?.[0]?.toUpperCase()}</span>}</div><p className="hilo-header-nombre">{contacto.nombre}</p></div>
    </div>
    <MensajeDirectoHilo userId={user.id} destinatarioId={usuarioId} mensajesIniciales={mensajesIniciales} />
  </div>;
}
