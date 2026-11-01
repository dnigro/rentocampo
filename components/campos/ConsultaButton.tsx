"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "@/lib/i18n/useTranslations";

interface Props {
  campoId: string;
  propietarioId?: string;
  userId?: string;
}

/** Abrir el borrador sin enviar consultas: sólo el botón Enviar del chat escribe mensajes. */
export default function ConsultaButton({ campoId, propietarioId, userId }: Props) {
  const { country } = useTranslations();
  const tt = (es: string, pt: string) => country === "BR" ? pt : es;
  const router = useRouter();
  const esPropietario = Boolean(userId && userId === propietarioId);

  if (esPropietario) {
    return <div className="consulta-propio">{tt("Esta es tu publicación", "Este anúncio é seu")}</div>;
  }

  return (
    <button
      type="button"
      className="btn-consultar"
      disabled={Boolean(userId && !propietarioId)}
      onClick={() => {
        if (!userId) {
          router.push(`/login?redirect=/campos/${campoId}`);
          return;
        }
        router.push(`/mensajes/${campoId}?borrador=consulta`);
      }}
    >
      {userId
        ? tt("Consultar campo", "Consultar terra")
        : tt("Ingresá para consultar", "Entre para consultar")}
    </button>
  );
}
