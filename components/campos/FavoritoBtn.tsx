"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Props {
  campoId: string;
  userId?: string;
}

export default function FavoritoBtn({ campoId, userId }: Props) {
  const [esFavorito, setEsFavorito] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (!userId) return;
    supabase
      .from("favoritos")
      .select("id")
      .eq("campo_id", campoId)
      .eq("usuario_id", userId)
      .maybeSingle()
      .then(({ data }) => setEsFavorito(!!data));
  }, [campoId, userId]);

  async function handleToggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!userId) {
      router.push(`/login?redirect=/campos/${campoId}`);
      return;
    }

    setLoading(true);
    if (esFavorito) {
      await supabase
        .from("favoritos")
        .delete()
        .eq("campo_id", campoId)
        .eq("usuario_id", userId);
      setEsFavorito(false);
    } else {
      await supabase
        .from("favoritos")
        .insert({ campo_id: campoId, usuario_id: userId });
      setEsFavorito(true);
    }
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`fav-text-btn ${esFavorito ? "fav-text-btn-activo" : ""}`}
    >
      <span className="fav-text-btn-icon">{esFavorito ? "♥" : "♡"}</span>
      <span className="fav-text-btn-label">
        {loading ? "..." : esFavorito ? "Guardado" : "Guardar campo"}
      </span>
    </button>
  );
}
