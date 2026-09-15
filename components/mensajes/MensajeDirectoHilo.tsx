"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Mensaje {
  id: string;
  contenido: string;
  created_at: string;
  remitente_id: string;
}

interface Props {
  userId: string;
  destinatarioId: string;
  mensajesIniciales: Mensaje[];
}

export default function MensajeDirectoHilo({ userId, destinatarioId, mensajesIniciales }: Props) {
  const [mensajes, setMensajes] = useState(mensajesIniciales);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [supabase] = useState(createClient);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  useEffect(() => {
    const channel = supabase
      .channel(`mensaje-directo-${userId}-${destinatarioId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "mensajes_directos",
          filter: `destinatario_id=eq.${userId}`,
        },
        async (payload) => {
          if (payload.new.remitente_id !== destinatarioId) return;

          const nuevo = payload.new as Mensaje;
          setMensajes((actuales) =>
            actuales.some((mensaje) => mensaje.id === nuevo.id)
              ? actuales
              : [...actuales, nuevo],
          );
          await supabase
            .from("mensajes_directos")
            .update({ leido: true })
            .eq("id", nuevo.id);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [destinatarioId, supabase, userId]);

  async function enviar(event: React.FormEvent) {
    event.preventDefault();
    const contenido = texto.trim();
    if (!contenido || enviando) return;

    setEnviando(true);
    setError("");
    const { data, error } = await supabase.from("mensajes_directos")
      .insert({ remitente_id: userId, destinatario_id: destinatarioId, contenido })
      .select("id, contenido, created_at, remitente_id")
      .single();

    if (error) {
      console.error("Error enviando mensaje directo:", error);
      setError("No pudimos enviar el mensaje. Ejecutá la migración 20260909_create_mensajes_directos.sql en Supabase.");
      setEnviando(false);
      return;
    }

    if (data) setMensajes((actuales) => [...actuales, data]);
    setTexto("");
    setEnviando(false);
  }

  return <div className="hilo-container">
    <div className="hilo-mensajes">
      {mensajes.length === 0 && <div className="hilo-vacio"><p>Iniciá la conversación.</p></div>}
      {mensajes.map((mensaje) => <div className={`mensaje-row ${mensaje.remitente_id === userId ? "mensaje-mio" : "mensaje-otro"}`} key={mensaje.id}>
        <div className={`mensaje-burbuja ${mensaje.remitente_id === userId ? "burbuja-mia" : "burbuja-otra"}`}>{mensaje.contenido}</div>
      </div>)}
      <div ref={bottomRef} />
    </div>
    {error && <p role="alert" className="mensaje-error">{error}</p>}
    <form className="mensaje-form" onSubmit={enviar}>
      <input className="mensaje-input" placeholder="Escribí un mensaje..." value={texto} onChange={(event) => setTexto(event.target.value)} disabled={enviando} autoComplete="off" />
      <button type="submit" className="mensaje-send" disabled={!texto.trim() || enviando}>{enviando ? "..." : "↑"}</button>
    </form>
  </div>;
}
