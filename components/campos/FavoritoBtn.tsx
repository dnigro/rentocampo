"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Props {
  campoId: string;
  userId?: string;
}

export default function FavoritoBtn({ campoId, userId }: Props) {
  const [esFavorito, setEsFavorito] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (!userId) {
      setEsFavorito(false);
      return;
    }

    let active = true;

    async function cargarFavorito() {
      const { data, error: queryError } = await supabase
        .from("favoritos")
        .select("id")
        .eq("campo_id", campoId)
        .eq("usuario_id", userId)
        .maybeSingle();

      if (!active) return;

      if (queryError) {
        console.error("No se pudo consultar el favorito", queryError);
        setError("No pudimos consultar tus favoritos.");
        return;
      }

      setEsFavorito(Boolean(data));
    }

    void cargarFavorito();

    return () => {
      active = false;
    };
  }, [campoId, userId]);

  async function handleToggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!userId) {
      router.push(`/login?redirect=/campos/${campoId}`);
      return;
    }

    setLoading(true);
    setError("");

    if (esFavorito) {
      const { error: deleteError } = await supabase
        .from("favoritos")
        .delete()
        .eq("campo_id", campoId)
        .eq("usuario_id", userId);

      if (deleteError) {
        console.error("No se pudo quitar el favorito", deleteError);
        setError("No pudimos quitar el campo de favoritos.");
        setLoading(false);
        return;
      }

      setEsFavorito(false);
    } else {
      const { error: insertError } = await supabase
        .from("favoritos")
        .insert({ campo_id: campoId, usuario_id: userId });

      if (insertError && insertError.code !== "23505") {
        console.error("No se pudo guardar el favorito", insertError);
        setError("No pudimos guardar el campo. Intentá nuevamente.");
        setLoading(false);
        return;
      }

      setEsFavorito(true);
    }

    setLoading(false);
    router.refresh();
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleToggle}
        disabled={loading}
        aria-pressed={esFavorito}
        className={`fav-text-btn ${esFavorito ? "fav-text-btn-activo" : ""}`}
      >
        <span className="fav-text-btn-icon" aria-hidden="true">
          {esFavorito ? "♥" : "♡"}
        </span>
        <span className="fav-text-btn-label">
          {loading ? "Guardando..." : esFavorito ? "Guardado" : "Guardar campo"}
        </span>
      </button>
      {error && (
        <p role="alert" className="fav-text-error">
          {error}
        </p>
      )}
    </div>
  );
}
