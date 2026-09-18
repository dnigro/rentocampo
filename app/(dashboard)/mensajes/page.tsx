import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import Link from "next/link";
import MensajesRealtime from "@/components/mensajes/MensajesRealtime";
import "@/styles/mensajes.css";

interface PerfilHilo {
  id: string;
  nombre: string;
  avatar_url: string | null;
}

interface CampoHilo {
  id: string;
  titulo: string;
  provincia: string;
  fotos: { url: string; orden: number | null }[];
}

interface Hilo {
  id: string;
  contenido: string;
  created_at: string;
  leido: boolean;
  remitente_id: string;
  destinatario_id: string;
  campo: CampoHilo | null;
  remitente: PerfilHilo | null;
  destinatario: PerfilHilo | null;
  noLeidos: number;
}

function relationValue<T>(value: T | T[] | null): T | null {
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export default async function MensajesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Traer último mensaje de cada campo donde participó el usuario
  const [mensajesResult, mensajesDirectosResult] = await Promise.all([
    supabase
      .from("mensajes")
      .select(
        `
      id,
      contenido,
      created_at,
      leido,
      remitente_id,
      destinatario_id,
      campo:campos(id, titulo, provincia, fotos:campos_fotos(url, orden)),
      remitente:profiles!mensajes_remitente_id_fkey(id, nombre, avatar_url),
      destinatario:profiles!mensajes_destinatario_id_fkey(id, nombre, avatar_url)
    `,
      )
      .or(`remitente_id.eq.${user.id},destinatario_id.eq.${user.id}`)
      .order("created_at", { ascending: false }),
    supabase
      .from("mensajes_directos")
      .select("id, contenido, created_at, leido, remitente_id, destinatario_id")
      .or(`remitente_id.eq.${user.id},destinatario_id.eq.${user.id}`)
      .order("created_at", { ascending: false }),
  ]);
  const { data: mensajes } = mensajesResult;
  const {
    data: mensajesDirectos,
    error: mensajesDirectosError,
  } = mensajesDirectosResult;

  if (mensajesDirectosError) {
    console.error("Error cargando mensajes directos:", mensajesDirectosError);
  }

  const idsPerfilesDirectos = Array.from(
    new Set(
      (mensajesDirectos ?? []).flatMap((mensaje) => [
        mensaje.remitente_id,
        mensaje.destinatario_id,
      ]),
    ),
  );
  const admin = createAdminClient();
  const { data: perfilesDirectos } = idsPerfilesDirectos.length
    ? await admin
        .from("profiles")
        .select("id, nombre, avatar_url")
        .in("id", idsPerfilesDirectos)
    : { data: [] };
  const perfilesPorId = new Map(
    (perfilesDirectos ?? []).map((perfil) => [perfil.id, perfil]),
  );

  // Agrupar por campo y sumar las conversaciones directas de servicios rurales.
  const hilosMap = new Map<string, Hilo>();
  for (const m of mensajes ?? []) {
    const campo = relationValue(
      m.campo as unknown as CampoHilo | CampoHilo[] | null,
    );
    const remitente = relationValue(
      m.remitente as unknown as PerfilHilo | PerfilHilo[] | null,
    );
    const destinatario = relationValue(
      m.destinatario as unknown as PerfilHilo | PerfilHilo[] | null,
    );
    const campoId = campo?.id;
    const otroId = m.remitente_id === user.id ? m.destinatario_id : m.remitente_id;
    const clave = campoId ? `campo:${campoId}` : `directo:${otroId}`;
    if (!hilosMap.has(clave)) {
      hilosMap.set(clave, {
        ...m,
        campo,
        remitente,
        destinatario,
        noLeidos: 0,
      });
    }
  }
  for (const m of mensajesDirectos ?? []) {
    const otroId = m.remitente_id === user.id ? m.destinatario_id : m.remitente_id;
    const clave = `directo:${otroId}`;
    if (hilosMap.has(clave)) continue;

    hilosMap.set(clave, {
      ...m,
      campo: null,
      remitente: perfilesPorId.get(m.remitente_id) ?? null,
      destinatario: perfilesPorId.get(m.destinatario_id) ?? null,
      noLeidos: 0,
    });
  }

  const noLeidosPorHilo = new Map<string, number>();
  for (const mensaje of mensajes ?? []) {
    if (mensaje.leido || mensaje.destinatario_id !== user.id) continue;
    const campo = relationValue(
      mensaje.campo as unknown as CampoHilo | CampoHilo[] | null,
    );
    const otroId =
      mensaje.remitente_id === user.id
        ? mensaje.destinatario_id
        : mensaje.remitente_id;
    const clave = campo?.id ? `campo:${campo.id}` : `directo:${otroId}`;
    noLeidosPorHilo.set(clave, (noLeidosPorHilo.get(clave) ?? 0) + 1);
  }
  for (const mensaje of mensajesDirectos ?? []) {
    if (mensaje.leido || mensaje.destinatario_id !== user.id) continue;
    const otroId =
      mensaje.remitente_id === user.id
        ? mensaje.destinatario_id
        : mensaje.remitente_id;
    const clave = `directo:${otroId}`;
    noLeidosPorHilo.set(clave, (noLeidosPorHilo.get(clave) ?? 0) + 1);
  }

  const hilos = Array.from(hilosMap.values()).map((hilo) => {
    const otroId =
      hilo.remitente_id === user.id
        ? hilo.destinatario_id
        : hilo.remitente_id;
    const clave = hilo.campo?.id
      ? `campo:${hilo.campo.id}`
      : `directo:${otroId}`;
    return { ...hilo, noLeidos: noLeidosPorHilo.get(clave) ?? 0 };
  }).sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return (
    <div className="page-container mensajes-container">
      <MensajesRealtime userId={user.id} />
      <div className={`mensajes-page ${hilos.length === 0 ? "mensajes-page-vacia" : ""}`}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Mensajes</h1>
          <p className="page-subtitle">
            {hilos.length > 0
              ? `${hilos.length} conversación${hilos.length !== 1 ? "es" : ""}`
              : "No tenés conversaciones todavía"}
          </p>
        </div>
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
            const campo = hilo.campo;
            const esDirecto = campo === null;
            const remitente = hilo.remitente;
            const destinatario = hilo.destinatario;
            const esRemitente = hilo.remitente_id === user.id;
            const otroUsuario = esRemitente ? destinatario : remitente;
            const noLeido = hilo.noLeidos > 0;
            const fotosCampo = Array.isArray(campo?.fotos) ? campo.fotos : [];
            const fotoCampo = [...fotosCampo].sort(
              (a, b) => (a.orden ?? 0) - (b.orden ?? 0),
            )[0]?.url;

            return (
              <Link
                key={hilo.id}
                href={campo ? `/mensajes/${campo.id}` : `/mensajes/direct/${otroUsuario?.id}`}
                className={`hilo-item ${noLeido ? "hilo-no-leido" : ""}`}
              >
                <div className={`hilo-media ${esDirecto ? "hilo-media-directo" : ""}`}>
                  {fotoCampo ? (
                    <img
                      className="hilo-campo-foto"
                      src={fotoCampo}
                      alt={`Campo ${campo?.titulo ?? ""}`}
                    />
                  ) : esDirecto ? (
                    otroUsuario?.avatar_url ? (
                      <img
                        className="hilo-avatar-directo"
                        src={otroUsuario.avatar_url}
                        alt={otroUsuario.nombre}
                      />
                    ) : (
                      <span className="hilo-media-inicial">
                        {otroUsuario?.nombre?.[0]?.toUpperCase()}
                      </span>
                    )
                  ) : (
                    <span className="hilo-campo-placeholder" aria-hidden="true">🌿</span>
                  )}

                  {!esDirecto && (
                    <span className="hilo-avatar-mini">
                      {otroUsuario?.avatar_url ? (
                        <img src={otroUsuario.avatar_url} alt="" />
                      ) : (
                        otroUsuario?.nombre?.[0]?.toUpperCase()
                      )}
                    </span>
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
                  <span className="hilo-campo">
                    {campo?.titulo ?? "Conversación directa"}
                  </span>
                  <p className="hilo-preview">
                    {esRemitente ? "Vos: " : ""}
                    {hilo.contenido}
                  </p>
                </div>
                {noLeido && (
                  <span className="hilo-nuevo">
                    {hilo.noLeidos} mensaje{hilo.noLeidos === 1 ? "" : "s"} sin leer
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
      </div>
    </div>
  );
}
