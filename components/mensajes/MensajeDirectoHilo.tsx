"use client";

import { useEffect, useRef, useState } from "react";
import { trackEvent } from "@/lib/analytics";

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
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  useEffect(() => {
    let activo = true;
    let actualizando = false;

    async function actualizarMensajes() {
      if (actualizando) return;
      actualizando = true;

      try {
        const response = await fetch(
          `/api/mensajes/directos?interlocutorId=${encodeURIComponent(destinatarioId)}`,
          { cache: "no-store" },
        );
        if (!response.ok) return;

        const result = await response.json();
        if (activo && Array.isArray(result.mensajes)) {
          const nuevos = result.mensajes as Mensaje[];
          setMensajes((actuales) => {
            const sinCambios =
              actuales.length === nuevos.length &&
              actuales.every(
                (mensaje, index) =>
                  mensaje.id === nuevos[index]?.id,
              );
            return sinCambios ? actuales : nuevos;
          });
        }
      } catch (cause) {
        console.error("Error actualizando mensajes directos:", cause);
      } finally {
        actualizando = false;
      }
    }

    actualizarMensajes();
    const polling = window.setInterval(actualizarMensajes, 4000);

    return () => {
      activo = false;
      window.clearInterval(polling);
    };
  }, [destinatarioId]);

  async function enviar(event: React.FormEvent) {
    event.preventDefault();
    const contenido = texto.trim();
    if (!contenido || enviando) return;

    setEnviando(true);
    setError("");
    try {
      const response = await fetch("/api/mensajes/directos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destinatarioId, contenido }),
      });
      const result = await response.json();

      if (!response.ok || !result.mensaje) {
        console.error("Error enviando mensaje directo:", result.error);
        setError(result.error ?? "No pudimos enviar el mensaje. Intentá nuevamente.");
        return;
      }

      setMensajes((actuales) =>
        actuales.some((mensaje) => mensaje.id === result.mensaje.id)
          ? actuales
          : [...actuales, result.mensaje],
      );
      setTexto("");
      trackEvent("enviar_mensaje", { tipo: "directo" });
    } catch (cause) {
      console.error("Error enviando mensaje directo:", cause);
      setError("No pudimos conectar para enviar el mensaje. Intentá nuevamente.");
    } finally {
      setEnviando(false);
    }
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
