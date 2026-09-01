"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import BrandWordmark from "@/components/layout/BrandWordmark";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [noLeidos, setNoLeidos] = useState(0);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const [supabase] = useState(createClient);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_e, session) => {
        setUser(session?.user ?? null);
      },
    );
    return () => listener.subscription.unsubscribe();
  }, [supabase.auth]);

  useEffect(() => {
    if (!user) {
      return;
    }
    const userId = user.id;

    async function contarNoLeidos() {
      const { count } = await supabase
        .from("mensajes")
        .select("id", { count: "exact", head: true })
        .eq("destinatario_id", userId)
        .eq("leido", false);
      setNoLeidos(count ?? 0);
    }

    contarNoLeidos();

    const channel = supabase
      .channel("navbar-mensajes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "mensajes",
          filter: `destinatario_id=eq.${userId}`,
        },
        () => contarNoLeidos(),
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "mensajes",
          filter: `destinatario_id=eq.${userId}`,
        },
        () => contarNoLeidos(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, user]);

  // Bloquear scroll cuando menú abierto
  useEffect(() => {
    document.body.style.overflow = menuAbierto ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuAbierto]);

  async function handleLogout() {
    await supabase.auth.signOut();
    setMenuAbierto(false);
    router.push("/");
    router.refresh();
  }

  const enMensajes = pathname?.startsWith("/mensajes");

  return (
    <>
      <header className="navbar">
        <div className="navbar-inner">
          <Link href="/" className="navbar-logo">
            <BrandWordmark className="brand-wordmark-nav" />
          </Link>

          {/* Links desktop */}
          <nav className="navbar-links">
            <Link href="/campos" className="nav-link">
              Buscar campos
            </Link>
            <Link href="/campos/mapa" className="nav-link">
              Mapa
            </Link>
          </nav>

          {/* Acciones desktop */}
          <div className="navbar-actions navbar-desktop">
            {user ? (
              <>
                <Link
                  href="/mensajes"
                  className={`navbar-mensajes ${enMensajes ? "active" : ""}`}
                  title="Mensajes"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M17.5 12.5C17.5 13.163 17.2366 13.7989 16.7678 14.2678C16.2989 14.7366 15.663 15 15 15H5L2.5 17.5V5C2.5 4.33696 2.76339 3.70107 3.23223 3.23223C3.70107 2.76339 4.33696 2.5 5 2.5H15C15.663 2.5 16.2989 2.76339 16.7678 3.23223C17.2366 3.70107 17.5 4.33696 17.5 5V12.5Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {noLeidos > 0 && (
                    <span className="navbar-badge">
                      {noLeidos > 9 ? "9+" : noLeidos}
                    </span>
                  )}
                </Link>
                <Link href="/dashboard" className="btn-ghost">
                  Mi cuenta
                </Link>
                <button onClick={handleLogout} className="btn-ghost">
                  Salir
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-ghost">
                  Ingresar
                </Link>
                <Link href="/register" className="btn-primary">
                  Publicar campo
                </Link>
              </>
            )}
          </div>

          {/* Hamburguesa mobile */}
          <div className="navbar-mobile-right">
            {user && (
              <Link
                href="/mensajes"
                className={`navbar-mensajes ${enMensajes ? "active" : ""}`}
                title="Mensajes"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M17.5 12.5C17.5 13.163 17.2366 13.7989 16.7678 14.2678C16.2989 14.7366 15.663 15 15 15H5L2.5 17.5V5C2.5 4.33696 2.76339 3.70107 3.23223 3.23223C3.70107 2.76339 4.33696 2.5 5 2.5H15C15.663 2.5 16.2989 2.76339 16.7678 3.23223C17.2366 3.70107 17.5 4.33696 17.5 5V12.5Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {noLeidos > 0 && (
                  <span className="navbar-badge">
                    {noLeidos > 9 ? "9+" : noLeidos}
                  </span>
                )}
              </Link>
            )}
            <button
              className="hamburguesa"
              onClick={() => setMenuAbierto((p) => !p)}
              aria-label="Menú"
            >
              {menuAbierto ? "✕" : "☰"}
            </button>
          </div>
        </div>
      </header>

      {/* Menú mobile overlay */}
      {menuAbierto && (
        <div className="mobile-menu" onClick={() => setMenuAbierto(false)}>
          <div
            className="mobile-menu-inner"
            onClick={(e) => e.stopPropagation()}
          >
            <nav
              className="mobile-menu-nav"
              onClick={() => setMenuAbierto(false)}
            >
              <Link href="/campos" className="mobile-menu-link">
                🔍 Buscar campos
              </Link>
              <Link href="/campos/mapa" className="mobile-menu-link">
                🗺️ Mapa
              </Link>

              <div className="mobile-menu-sep" />

              {user ? (
                <>
                  <Link href="/dashboard" className="mobile-menu-link">
                    👤 Mi cuenta
                  </Link>
                  <Link href="/mensajes" className="mobile-menu-link">
                    💬 Mensajes
                    {noLeidos > 0 && (
                      <span className="mobile-badge">{noLeidos}</span>
                    )}
                  </Link>
                  <Link href="/favoritos" className="mobile-menu-link">
                    ❤️ Favoritos
                  </Link>
                  <Link href="/perfil" className="mobile-menu-link">
                    ⚙️ Mi perfil
                  </Link>

                  <div className="mobile-menu-sep" />

                  <button
                    onClick={handleLogout}
                    className="mobile-menu-link mobile-menu-logout"
                  >
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="mobile-menu-link">
                    Ingresar
                  </Link>
                  <Link href="/register" className="mobile-menu-btn">
                    Publicar campo gratis
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
