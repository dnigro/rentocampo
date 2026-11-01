"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "@/lib/i18n/useTranslations";

/** Solo abre el borrador: ningún mensaje se envía al pulsar Continuar. */
export default function LiteConsult({ campoId }: { campoId: string; propietarioId: string }) {
  const { country } = useTranslations();
  const tt = (es: string, pt: string) => country === "BR" ? pt : es;
  const [confirmed, setConfirmed] = useState(false);
  const router = useRouter();

  return (
    <section>
      <label style={{ display: "flex", alignItems: "flex-start", gap: 10, margin: "20px 0", fontSize: 15 }}>
        <input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} style={{ width: 22, height: 22, flexShrink: 0 }} />
        <span>{tt("Quiero abrir el chat para escribir mi consulta. El mensaje solo se enviará cuando presione Enviar mensaje.", "Quero abrir o chat para escrever minha consulta. A mensagem só será enviada quando eu pressionar Enviar mensagem.")}</span>
      </label>
      <button type="button" disabled={!confirmed}
        onClick={() => router.push(`/lite/campos/${campoId}/consultar`)}
        style={{ width: "100%", background: confirmed ? "#d5bd72" : "#777", color: confirmed ? "#191a1c" : "#fff", padding: 16, borderRadius: 999, border: 0, fontSize: 16, fontWeight: 850 }}>
        {tt("Continuar al mensaje", "Continuar para a mensagem")}
      </button>
    </section>
  );
}
