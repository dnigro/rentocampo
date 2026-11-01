"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { trackEvent } from "@/lib/analytics";
import { useTranslations } from "@/lib/i18n/useTranslations";

interface Mensaje {
  id: string;
  contenido: string;
  created_at: string;
  leido: boolean;
  remitente_id: string;
  remitente: { id: string; nombre: string; avatar_url?: string } | null;
}

interface Props {
  campoId?: string;
  userId: string;
  destinatarioId: string;
  mensajesIniciales: Mensaje[];
  borradorConsulta?: boolean;
}

export default function MensajeHilo({
  campoId,
  userId,
  destinatarioId,
  mensajesIniciales,
  borradorConsulta = false,
}: Props) {
  const {country}=useTranslations();
  const tt=(es:string,pt:string)=>country==="BR"?pt:es;
  const [mensajes, setMensajes] = useState<Mensaje[]>(mensajesIniciales);
  const [texto, setTexto] = useState(() =>
    borradorConsulta
      ? tt("Hola, me interesa este campo. ¿Podemos hablar?", "Olá, tenho interesse nesta propriedade rural. Podemos conversar?")
      : "",
  );
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const [supabase] = useState(createClient);

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
          filter: campoId ? `campo_id=eq.${campoId}` : "campo_id=is.null",
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
              window.dispatchEvent(new Event("mensajes:actualizar"));
            }
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [campoId, supabase, userId]);

  async function handleEnviar(e: React.FormEvent) {
    e.preventDefault();
    const contenido = texto.trim();
    if (!contenido || enviando) return;

    setEnviando(true);
    setError("");
    setTexto("");

    try {
      const response = await fetch("/api/mensajes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campoId, destinatarioId, contenido }),
      });
      const result = await response.json();

      if (!response.ok || !result.mensaje) {
        setTexto(contenido);
        console.error("Error enviando mensaje:", result.error);
        setError(result.error ?? tt("No pudimos enviar el mensaje. Intentá nuevamente.","Não foi possível enviar a mensagem. Tente novamente."));
        return;
      }

      const mensaje: Mensaje = { ...result.mensaje, remitente: null };
      setMensajes((prev) => prev.some((item) => item.id === mensaje.id) ? prev : [...prev, mensaje]);
      trackEvent("enviar_mensaje", { tipo: campoId ? "campo" : "general" });
    } catch (cause) {
      console.error("Error enviando mensaje:", cause);
      setTexto(contenido);
      setError(tt("No pudimos conectar para enviar el mensaje. Intentá nuevamente.","Não foi possível conectar para enviar a mensagem. Tente novamente."));
    } finally {
      setEnviando(false);
    }
  }

  function formatFecha(fecha: string) {
    const d = new Date(fecha);
    const hoy = new Date();
    const esHoy = d.toDateString() === hoy.toDateString();
    if (esHoy)
      return d.toLocaleTimeString(country==="BR"?"pt-BR":"es-AR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    return (
      d.toLocaleDateString(country==="BR"?"pt-BR":"es-AR", { day: "numeric", month: "short" }) +
      " " +
      d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })
    );
  }

  function fechaGrupo(fecha: string) {
    const d = new Date(fecha);
    const hoy = new Date();
    const ayer = new Date(hoy);
    ayer.setDate(ayer.getDate() - 1);
    if (d.toDateString() === hoy.toDateString()) return tt("Hoy","Hoje");
    if (d.toDateString() === ayer.toDateString()) return tt("Ayer","Ontem");
    return d.toLocaleDateString("es-AR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  }

  const mensajesConGrupo = mensajes.map((mensaje, index) => {
    const grupo = fechaGrupo(mensaje.created_at);
    const grupoAnterior =
      index > 0 ? fechaGrupo(mensajes[index - 1].created_at) : null;
    return { mensaje, grupo, mostrarGrupo: grupo !== grupoAnterior };
  });

  return (
    <div className="hilo-container">
      <div className="hilo-mensajes">
        {mensajes.length === 0 && (
          <div className="hilo-vacio">
            <p>{tt("No hay mensajes todavía. Iniciá la conversación.","Ainda não há mensagens. Inicie uma conversa.")}</p>
          </div>
        )}

        {mensajesConGrupo.map(({ mensaje: m, grupo, mostrarGrupo }) => {
          const esMio = m.remitente_id === userId;
          const remitente = m.remitente;

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
                      <Image
                        src={remitente.avatar_url}
                        alt={remitente.nombre}
                        width={40}
                        height={40}
                      />
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

      {error && <p role="alert" className="mensaje-error">{error}</p>}
      <form className="mensaje-compose" onSubmit={handleEnviar}>
        <label htmlFor="mensaje-campo-texto" className="mensaje-compose-label">{tt("Tu mensaje", "Sua mensagem")}</label>
        <textarea
          id="mensaje-campo-texto"
          className="mensaje-input mensaje-draft"
          placeholder={tt("Escribí un mensaje...", "Digite uma mensagem...")}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          disabled={enviando}
          maxLength={500}
          rows={4}
        />
        <div className="mensaje-compose-meta">{texto.length} / 500</div>
        <p className="mensaje-compose-note">{tt("Tu mensaje se enviará cuando presiones Enviar mensaje.", "Sua mensagem será enviada quando você pressionar Enviar mensagem.")}</p>
        <button type="submit" className="mensaje-compose-submit" disabled={!texto.trim() || enviando}>
          {enviando ? tt("Enviando...", "Enviando...") : tt("Enviar mensaje", "Enviar mensagem")}
        </button>
      </form>
    </div>
  );
}
