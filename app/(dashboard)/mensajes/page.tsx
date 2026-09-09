import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import "@/styles/mensajes.css";

export default async function MensajesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Traer último mensaje de cada campo donde participó el usuario
  const { data: mensajes } = await supabase
    .from("mensajes")
    .select(
      `
      id,
      contenido,
      created_at,
      leido,
      remitente_id,
      destinatario_id,
      campo:campos(id, titulo, provincia),
      remitente:profiles!mensajes_remitente_id_fkey(id, nombre, avatar_url),
      destinatario:profiles!mensajes_destinatario_id_fkey(id, nombre, avatar_url)
    `,
    )
    .or(`remitente_id.eq.${user.id},destinatario_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  // Agrupar por campo o por interlocutor en las conversaciones directas.
  const hilosMap = new Map<string, NonNullable<typeof mensajes>[number]>();
  for (const m of mensajes ?? []) {
    const campoId = (m.campo as any)?.id;
    const otroId = m.remitente_id === user.id ? m.destinatario_id : m.remitente_id;
    const clave = campoId ? `campo:${campoId}` : `directo:${otroId}`;
    if (!hilosMap.has(clave)) hilosMap.set(clave, m);
  }
  const hilos = Array.from(hilosMap.values());

  // Contar no leídos
  const noLeidos = (mensajes ?? []).filter(
    (m) => !m.leido && m.destinatario_id === user.id,
  ).length;

  return (
    <div className="page-container">
      <div className={`mensajes-page ${hilos.length === 0 ? "mensajes-page-vacia" : ""}`}>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Mensajes{" "}
            {noLeidos > 0 && <span className="badge-noLeido">{noLeidos}</span>}
          </h1>
          <p className="page-subtitle">
            {hilos.length > 0
              ? `${hilos.length} conversación${hilos.length !== 1 ? "es" : ""}`
              : "No tenés conversaciones todavía"}
          </p>
        </div>
        {hilos.length > 0 && <Link href="/mensajes/nuevo" className="btn-primary-lg">Nuevo mensaje</Link>}
      </div>

      {hilos.length === 0 ? (
        <div className="mensajes-empty-state">
          <span className="mensajes-empty-icon" aria-hidden="true">✉</span>
          <h2>Sin conversaciones todavía</h2>
          <p>Cuando alguien te escriba, la conversación aparecerá acá.</p>
        </div>
      ) : (
        <div className="hilos-lista">
          {hilos.map((hilo) => {
            const campo = hilo.campo as any;
            const esDirecto = !campo?.id;
            const remitente = hilo.remitente as any;
            const destinatario = hilo.destinatario as any;
            const esRemitente = hilo.remitente_id === user.id;
            const otroUsuario = esRemitente ? destinatario : remitente;
            const noLeido = !hilo.leido && hilo.destinatario_id === user.id;

            return (
              <Link
                key={hilo.id}
                href={esDirecto ? `/mensajes/direct/${otroUsuario?.id}` : `/mensajes/${campo.id}`}
                className={`hilo-item ${noLeido ? "hilo-no-leido" : ""}`}
              >
                <div className="hilo-avatar">
                  {otroUsuario?.avatar_url ? (
                    <img
                      src={otroUsuario.avatar_url}
                      alt={otroUsuario.nombre}
                    />
                  ) : (
                    <span>{otroUsuario?.nombre?.[0]?.toUpperCase()}</span>
                  )}
                </div>
                <div className="hilo-body">
                  <div className="hilo-top">
                    <span className="hilo-nombre">{otroUsuario?.nombre}</span>
                    <span className="hilo-fecha">
                      {new Date(hilo.created_at).toLocaleDateString("es-AR", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </div>
                  <span className="hilo-campo">{esDirecto ? "Conversación directa" : campo.titulo}</span>
                  <p className="hilo-preview">
                    {esRemitente ? "Vos: " : ""}
                    {hilo.contenido}
                  </p>
                </div>
                {noLeido && <span className="hilo-dot" />}
              </Link>
            );
          })}
        </div>
      )}
      </div>
    </div>
  );
}
