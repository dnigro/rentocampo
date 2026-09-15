"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function MensajesRealtime({ userId }: { userId: string }) {
  const router = useRouter();
  const [supabase] = useState(createClient);
  const [aviso, setAviso] = useState(false);

  useEffect(() => {
    let avisoTimer: ReturnType<typeof setTimeout> | undefined;

    function informar() {
      setAviso(true);
      router.refresh();
      if (avisoTimer) clearTimeout(avisoTimer);
      avisoTimer = setTimeout(() => setAviso(false), 5000);
    }

    const channel = supabase
      .channel(`bandeja-mensajes-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "mensajes",
          filter: `destinatario_id=eq.${userId}`,
        },
        informar,
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "mensajes_directos",
          filter: `destinatario_id=eq.${userId}`,
        },
        informar,
      )
      .subscribe();

    return () => {
      if (avisoTimer) clearTimeout(avisoTimer);
      supabase.removeChannel(channel);
    };
  }, [router, supabase, userId]);

  return aviso ? (
    <div className="mensaje-nuevo-aviso" role="status" aria-live="polite">
      <span aria-hidden="true">●</span>
      Tenés un nuevo mensaje
    </div>
  ) : null;
}
