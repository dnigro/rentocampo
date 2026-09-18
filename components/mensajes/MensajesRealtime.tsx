"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function MensajesRealtime({ userId }: { userId: string }) {
  const router = useRouter();
  const [supabase] = useState(createClient);

  useEffect(() => {
    function informar() {
      router.refresh();
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
      supabase.removeChannel(channel);
    };
  }, [router, supabase, userId]);

  return null;
}
