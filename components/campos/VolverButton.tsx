"use client";

import { useRouter } from "next/navigation";

export default function VolverButton() {
  const router = useRouter();
  return (
    <button className="btn-volver" onClick={() => router.back()}>
      ← Volver a resultados
    </button>
  );
}
