"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Mensaje {
  id: string;
  contenido: string;
  created_at: string;
  leido: boolean;
  remitente_id: string;
  remitente: { id: string; nombre: string; avatar_url?: string } | null;
}

interface Props {
  campoId: string;
  userId: string;
  destinatarioId: string;
  mensajesIniciales: Mensaje[];
}

export default function MensajeHilo({
  campoId,
  userId,
  destinatarioId,
  mensajesIniciales,
}: Props) {
  const [mensajes, setMensajes] = useState<Mensaje[]>(mensajesIniciales);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  useEffect(() => {
    const channel = supabase
      .channel(`mensajes-${campoId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "mensajes",
          filter: `campo_id=eq.${campoId}`,
        },
        async (payload) => {
          const { data } = await supabase
            .from("mensajes")
            .select(
              `id, contenido, created_at, leido, remitente_id,
              remitente:profiles!mensajes_remitente_id_fkey(id, nombre, avatar_url)`,
            )
            .eq("id", payload.new.id)
            .single();

          if (data) {
            const mensaje: Mensaje = {
              ...data,
              remitente: Array.isArray(data.remitente)
                ? (data.remitente[0] ?? null)
                : data.remitente,
            };

            setMensajes((prev) =>
              prev.find((m) => m.id === mensaje.id) ? prev : [...prev, mensaje],
            );

            if (payload.new.destinatario_id === userId) {
              await supabase
                .from("mensajes")
                .update({ leido: true })
                .eq("id", payload.new.id);
            }
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [campoId, userId]);

  async function handleEnviar(e: React.FormEvent) {
    e.preventDefault();
    const contenido = texto.trim();
    if (!contenido || enviando) return;

    setEnviando(true);
    setTexto("");

    const { data, error } = await supabase
      .from("mensajes")
      .insert({
        campo_id: campoId,
        remitente_id: userId,
        destinatario_id: destinatarioId,
        contenido,
      })
      .select("id")
      .single();

    if (error) {
      setTexto(contenido);
      console.error("Error enviando mensaje:", error);
      setEnviando(false);
      return;
    }

    // Disparar email de notificación en background
    if (data?.id) {
      fetch("/api/notificar-mensaje", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensajeId: data.id }),
      }).catch(console.error);
    }

    setEnviando(false);
  }

  function formatFecha(fecha: string) {
    const d = new Date(fecha);
    const hoy = new Date();
    const esHoy = d.toDateString() === hoy.toDateString();
    if (esHoy)
      return d.toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    return (
      d.toLocaleDateString("es-AR", { day: "numeric", month: "short" }) +
      " " +
      d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })
    );
  }

  function fechaGrupo(fecha: string) {
    const d = new Date(fecha);
    const hoy = new Date();
    const ayer = new Date(hoy);
    ayer.setDate(ayer.getDate() - 1);
    if (d.toDateString() === hoy.toDateString()) return "Hoy";
    if (d.toDateString() === ayer.toDateString()) return "Ayer";
    return d.toLocaleDateString("es-AR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  }

  let ultimaFecha = "";

  return (
    <div className="hilo-container">
      <div className="hilo-mensajes">
        {mensajes.length === 0 && (
          <div className="hilo-vacio">
            <p>No hay mensajes todavía. Iniciá la conversación.</p>
          </div>
        )}

        {mensajes.map((m) => {
          const esMio = m.remitente_id === userId;
          const remitente = m.remitente as any;
          const grupo = fechaGrupo(m.created_at);
          const mostrarGrupo = grupo !== ultimaFecha;
          ultimaFecha = grupo;

          return (
            <div key={m.id}>
              {mostrarGrupo && (
                <div className="fecha-separador">
                  <span>{grupo}</span>
                </div>
              )}
              <div
                className={`mensaje-row ${esMio ? "mensaje-mio" : "mensaje-otro"}`}
              >
                {!esMio && (
                  <div className="mensaje-avatar">
                    {remitente?.avatar_url ? (
                      <img src={remitente.avatar_url} alt={remitente.nombre} />
                    ) : (
                      <span>{remitente?.nombre?.[0]?.toUpperCase()}</span>
                    )}
                  </div>
                )}
                <div className="mensaje-burbuja-wrap">
                  <div
                    className={`mensaje-burbuja ${esMio ? "burbuja-mia" : "burbuja-otra"}`}
                  >
                    {m.contenido}
                  </div>
                  <span className="mensaje-hora">
                    {formatFecha(m.created_at)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form className="mensaje-form" onSubmit={handleEnviar}>
        <input
          type="text"
          className="mensaje-input"
          placeholder="Escribí un mensaje..."
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          disabled={enviando}
          autoComplete="off"
        />
        <button
          type="submit"
          className="mensaje-send"
          disabled={!texto.trim() || enviando}
        >
          {enviando ? "..." : "↑"}
        </button>
      </form>
    </div>
  );
}
