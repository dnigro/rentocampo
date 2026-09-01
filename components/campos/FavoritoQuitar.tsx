"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

interface Props {
  campoId: string;
  userId: string;
}

export default function FavoritosQuitar({ campoId, userId }: Props) {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  async function handleQuitar(e: React.MouseEvent) {
    e.preventDefault();
    setLoading(true);
    await supabase
      .from("favoritos")
      .delete()
      .eq("campo_id", campoId)
      .eq("usuario_id", userId);
    router.refresh();
  }

  return (
    <div className="fav-item-acciones">
      <Link href={`/campos/${campoId}`} className="fav-accion-ver">
        Ver campo →
      </Link>
      <button
        onClick={handleQuitar}
        disabled={loading}
        className="fav-accion-quitar"
      >
        {loading ? "..." : "Quitar de favoritos"}
      </button>
    </div>
  );
}
