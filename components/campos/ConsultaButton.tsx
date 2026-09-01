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

  const esPropietario = userId && userId === propietarioId;

  async function handleConsulta() {
    if (!userId) {
      router.push(`/login?redirect=/campos/${campoId}`);
      return;
    }
    if (esPropietario) return;

    setLoading(true);

    // Verificar si ya existe un hilo para este campo
    const { data: existente } = await supabase
      .from("mensajes")
      .select("id")
      .eq("campo_id", campoId)
      .eq("remitente_id", userId)
      .limit(1)
      .single();

    if (existente) {
      router.push(`/mensajes/${campoId}`);
      return;
    }

    // Crear primer mensaje
    const { error } = await supabase.from("mensajes").insert({
      campo_id: campoId,
      remitente_id: userId,
      destinatario_id: propietarioId,
      contenido: "Hola, me interesa este campo. ¿Podemos hablar?",
    });

    if (!error) {
      setEnviado(true);
      setTimeout(() => router.push(`/mensajes/${campoId}`), 800);
    }

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
  );
}
