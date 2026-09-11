"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

interface Props {
  campoId: string;
  propietarioId?: string;
  userId?: string;
}

export default function ConsultaButton({
  campoId,
  propietarioId,
  userId,
}: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState("");

  const esPropietario = userId && userId === propietarioId;

  async function handleConsulta() {
    if (!userId) {
      router.push(`/login?redirect=/campos/${campoId}`);
      return;
    }
    if (esPropietario) return;

    setLoading(true);
    setError("");

    // Verificar si ya existe un hilo para este campo
    const { data: existente } = await supabase
      .from("mensajes")
      .select("id")
      .eq("campo_id", campoId)
      .eq("remitente_id", userId)
      .limit(1)
      .single();

    if (existente) {
      setLoading(false);
      router.push(`/mensajes/${campoId}`);
      return;
    }

    // Crear el primer mensaje mediante el servidor para notificar al propietario.
    const response = await fetch("/api/mensajes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        campoId,
        destinatarioId: propietarioId,
        contenido: "Hola, me interesa este campo. ¿Podemos hablar?",
      }),
    });

    if (!response.ok) {
      const result = await response.json().catch(() => null);
      console.error("Error creando consulta:", result?.error);
      setError(result?.error ?? "No pudimos enviar la consulta. Intentá nuevamente.");
      setLoading(false);
      return;
    }

    setEnviado(true);
    setTimeout(() => router.push(`/mensajes/${campoId}`), 800);
    setLoading(false);
  }

  if (esPropietario) {
    return <div className="consulta-propio">Este es tu campo</div>;
  }

  if (enviado) {
    return (
      <div className="consulta-enviado">
        ✓ Consulta enviada — redirigiendo...
      </div>
    );
  }

  return (
    <>
    <button
      className="btn-consultar"
      onClick={handleConsulta}
      disabled={loading}
    >
      {loading
        ? "Enviando..."
        : userId
          ? "Consultar campo"
          : "Ingresá para consultar"}
    </button>
    {error && <p role="alert">{error}</p>}
    </>
  );
}
