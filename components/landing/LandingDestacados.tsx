import Link from "next/link";
import CampoCard from "@/components/campos/CampoCard";
import { createClient } from "@/lib/supabase/server";
import "@/styles/explorador.css";

export default async function LandingDestacados() {
  const supabase = await createClient();
  const { data: campos } = await supabase
    .from("campos")
    .select("*, fotos:campos_fotos(url, orden)")
    .eq("status", "activo")
    .order("created_at", { ascending: false })
    .limit(3);

  if (!campos?.length) return null;

  return (
    <section className="rc-featured" id="campos-destacados">
      <div className="rc-shell">
        <div className="rc-featured-head">
          <div>
            <p className="rc-kicker">Campos disponibles</p>
            <h2>Oportunidades para producir.</h2>
          </div>
          <Link href="/campos" className="rc-text-link">Ver todos los campos →</Link>
        </div>
        <div className="rc-featured-grid">
          {campos.map((campo) => <CampoCard key={campo.id} campo={campo} />)}
        </div>
      </div>
    </section>
  );
}
