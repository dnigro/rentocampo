"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Props { campoId: string; userId?: string }

export default function FavoritoBtn({ campoId, userId }: Props) {
  const [esFavorito, setEsFavorito] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!userId) return;
    let activo = true;
    fetch(`/api/favoritos?campoId=${encodeURIComponent(campoId)}`)
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error);
        if (activo) setEsFavorito(body.esFavorito);
      })
      .catch((cause) => activo && setError(cause instanceof Error ? cause.message : "No pudimos consultar tus favoritos."));
    return () => { activo = false; };
  }, [campoId, userId]);

  async function handleToggle(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (!userId) { router.push(`/login?redirect=/campos/${campoId}`); return; }

    setLoading(true); setError("");
    try {
      const response = await fetch(
        esFavorito ? `/api/favoritos?campoId=${encodeURIComponent(campoId)}` : "/api/favoritos",
        esFavorito ? { method: "DELETE" } : { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ campoId }) },
      );
      const body = await response.json();
      if (!response.ok) throw new Error(body.error);
      setEsFavorito(body.esFavorito);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No pudimos guardar el campo.");
    } finally { setLoading(false); }
  }

  return <div><button type="button" onClick={handleToggle} disabled={loading} aria-pressed={esFavorito} className={`fav-text-btn ${esFavorito ? "fav-text-btn-activo" : ""}`}><span className="fav-text-btn-icon" aria-hidden="true">{esFavorito ? "♥" : "♡"}</span><span className="fav-text-btn-label">{loading ? "Guardando..." : esFavorito ? "Guardado" : "Guardar campo"}</span></button>{error && <p role="alert" className="fav-text-error">{error}</p>}</div>;
}
