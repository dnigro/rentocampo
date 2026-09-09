import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import Link from "next/link";
import "@/styles/mensajes.css";

export default async function NuevoMensajePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const admin = createAdminClient();
  const { data: perfiles } = await admin
    .from("profiles")
    .select("id, nombre, apellido, avatar_url, roles")
    .neq("id", user.id)
    .order("nombre");

  const contactos = (perfiles ?? []).filter((perfil) =>
    perfil.roles?.some((rol: string) => rol === "productor" || rol === "propietario"),
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Nuevo mensaje</h1>
          <p className="page-subtitle">Elegí a quién querés contactar</p>
        </div>
      </div>
      <div className="hilos-lista">
        {contactos.map((contacto) => (
          <Link key={contacto.id} href={`/mensajes/direct/${contacto.id}`} className="hilo-item">
            <div className="hilo-avatar">
              {contacto.avatar_url ? <img src={contacto.avatar_url} alt={contacto.nombre} /> : <span>{contacto.nombre?.[0]?.toUpperCase()}</span>}
            </div>
            <div className="hilo-body">
              <span className="hilo-nombre">{[contacto.nombre, contacto.apellido].filter(Boolean).join(" ")}</span>
              <span className="hilo-campo">{contacto.roles?.join(" · ")}</span>
            </div>
          </Link>
        ))}
        {contactos.length === 0 && <p>No hay contactos disponibles todavía.</p>}
      </div>
    </div>
  );
}
