"use client";

import { useEffect, useRef, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import { useTranslations } from "@/lib/i18n/useTranslations";

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
  borradorServicio?: boolean;
}

export default function MensajeDirectoHilo({ userId, destinatarioId, mensajesIniciales, borradorServicio = false }: Props) {
  const {country}=useTranslations();
  const tt=(es:string,pt:string)=>country==="BR"?pt:es;
  const [mensajes, setMensajes] = useState(mensajesIniciales);
  const mensajesRef = useRef(mensajesIniciales);
  const [texto, setTexto] = useState(() =>
    borradorServicio
      ? tt("Hola, me interesa tu servicio rural. ¿Podrías darme más información?", "Olá, tenho interesse no seu serviço rural. Poderia me dar mais informações?")
      : "",
  );
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
          const actuales = mensajesRef.current;
          const sinCambios =
            actuales.length === nuevos.length &&
            actuales.every(
              (mensaje, index) => mensaje.id === nuevos[index]?.id,
            );

          if (!sinCambios) {
            mensajesRef.current = nuevos;
            setMensajes(nuevos);
            window.dispatchEvent(new Event("mensajes:actualizar"));
          }
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
        setError(result.error ?? tt("No pudimos enviar el mensaje. Intentá nuevamente.","Não foi possível enviar a mensagem. Tente novamente."));
        return;
      }

      setMensajes((actuales) => {
        const siguientes = actuales.some((mensaje) => mensaje.id === result.mensaje.id)
          ? actuales
          : [...actuales, result.mensaje];
        mensajesRef.current = siguientes;
        return siguientes;
      });
      setTexto("");
      trackEvent("enviar_mensaje", { tipo: "directo" });
    } catch (cause) {
      console.error("Error enviando mensaje directo:", cause);
      setError(tt("No pudimos conectar para enviar el mensaje. Intentá nuevamente.","Não foi possível conectar para enviar a mensagem. Tente novamente."));
    } finally {
      setEnviando(false);
    }
  }

  return <div className="hilo-container">
    <div className="hilo-mensajes">
      {mensajes.length === 0 && <div className="hilo-vacio"><p>{tt("Iniciá la conversación.","Inicie uma conversa.")}</p></div>}
      {mensajes.map((mensaje) => <div className={`mensaje-row ${mensaje.remitente_id === userId ? "mensaje-mio" : "mensaje-otro"}`} key={mensaje.id}>
        <div className={`mensaje-burbuja ${mensaje.remitente_id === userId ? "burbuja-mia" : "burbuja-otra"}`}>{mensaje.contenido}</div>
      </div>)}
      <div ref={bottomRef} />
    </div>
    {error && <p role="alert" className="mensaje-error">{error}</p>}
    <form className="mensaje-compose" onSubmit={enviar}>
      <label htmlFor="mensaje-directo-texto" className="mensaje-compose-label">{tt("Tu mensaje", "Sua mensagem")}</label>
      <textarea id="mensaje-directo-texto" className="mensaje-input mensaje-draft" rows={4} maxLength={500}
        placeholder={tt("Escribí un mensaje...", "Digite uma mensagem...")} value={texto}
        onChange={(event) => setTexto(event.target.value)} disabled={enviando} />
      <div className="mensaje-compose-meta">{texto.length} / 500</div>
      <p className="mensaje-compose-note">{tt("Tu mensaje se enviará cuando presiones Enviar mensaje.", "Sua mensagem será enviada quando você pressionar Enviar mensagem.")}</p>
      <button type="submit" className="mensaje-compose-submit" disabled={!texto.trim() || enviando}>
        {enviando ? tt("Enviando...", "Enviando...") : tt("Enviar mensaje", "Enviar mensagem")}
      </button>
    </form>
  </div>;
}
