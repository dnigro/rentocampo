"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { useTranslations } from "@/lib/i18n/useTranslations";

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
  const {country}=useTranslations();
  const tt=(es:string,pt:string)=>country==="BR"?pt:es;
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

    // Crear el primer mensaje mediante la API para disparar la notificación por email.
    const response = await fetch("/api/mensajes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        campoId,
        destinatarioId: propietarioId,
        contenido: tt("Hola, me interesa este campo. ¿Podemos hablar?","Olá, tenho interesse nesta propriedade rural. Podemos conversar?"),
      }),
    });
    const result = await response.json();

    if (!response.ok || !result.mensaje) {
      console.error("Error creando consulta:", result.error);
      setError(result.error ?? tt("No pudimos enviar la consulta. Intentá nuevamente.","Não foi possível enviar a consulta. Tente novamente."));
      setLoading(false);
      return;
    }

    setEnviado(true);
    setTimeout(() => router.push(`/mensajes/${campoId}`), 800);
    setLoading(false);
  }

  if (esPropietario) {
    return <div className="consulta-propio">{tt("Esta es tu publicación","Este anúncio é seu")}</div>;
  }

  if (enviado) {
    return (
      <div className="consulta-enviado">
        ✓ {tt("Consulta enviada — redirigiendo...","Consulta enviada — redirecionando...")}
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
        ? tt("Enviando...","Enviando...")
        : userId
          ? tt("Consultar campo","Consultar terra")
          : tt("Ingresá para consultar","Entre para consultar")}
    </button>
    {error && <p role="alert">{error}</p>}
    </>
  );
}
