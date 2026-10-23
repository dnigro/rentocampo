"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Suspense, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import BrandWordmark from "@/components/layout/BrandWordmark";
import { regionalText } from "@/lib/i18n/regional";
import { selectRegionalCountry, useRegionalCountry } from "@/lib/i18n/useRegionalCountry";
import { COUNTRIES, COUNTRY_CODES_ALPHABETICAL, type CountryCode } from "@/data/countries";

function NavbarContent() {
  const [user, setUser] = useState<User | null>(null);
  const [noLeidos, setNoLeidos] = useState(0);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [countrySelectReady, setCountrySelectReady] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const activeCountry = useRegionalCountry();
  const [supabase] = useState(createClient);

  // Prevent a native pre-hydration country change from being ignored.
  useEffect(() => {
    const id = window.setTimeout(() => setCountrySelectReady(true), 0);
    return () => window.clearTimeout(id);
  }, []);

  function cambiarPais(country: CountryCode) {
    if (country === activeCountry) return;
    selectRegionalCountry(country);
    // The URL and cookie were already updated by selectRegionalCountry.
    // Refresh server components so the map and its country-specific pins really switch.
    router.refresh();
  }

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
      try {
        const response = await fetch("/api/mensajes/no-leidos", {
          cache: "no-store",
        });
        if (!response.ok) return;

        const result = await response.json();
        setNoLeidos(typeof result.total === "number" ? result.total : 0);
      } catch (error) {
        console.error("Error actualizando mensajes no leídos:", error);
      }
    }

    contarNoLeidos();
    // Realtime cubre las novedades; este respaldo evita consultas constantes
    // y recupera el estado si la suscripción se interrumpe.
    const polling = window.setInterval(contarNoLeidos, 60000);
    const actualizarAlVolver = () => void contarNoLeidos();
    const actualizarAlMostrar = () => {
      if (document.visibilityState === "visible") void contarNoLeidos();
    };
    window.addEventListener("focus", actualizarAlVolver);
    window.addEventListener("mensajes:actualizar", actualizarAlVolver);
    document.addEventListener("visibilitychange", actualizarAlMostrar);

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
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "mensajes_directos",
          filter: `destinatario_id=eq.${userId}`,
        },
        () => contarNoLeidos(),
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "mensajes_directos",
          filter: `destinatario_id=eq.${userId}`,
        },
        () => contarNoLeidos(),
      )
      .subscribe();

    return () => {
      window.clearInterval(polling);
      window.removeEventListener("focus", actualizarAlVolver);
      window.removeEventListener("mensajes:actualizar", actualizarAlVolver);
      document.removeEventListener("visibilitychange", actualizarAlMostrar);
      supabase.removeChannel(channel);
    };
  }, [pathname, supabase, user]);

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

          {/* Navegación principal compartida en todo el sitio */}
          <nav className="navbar-links" aria-label="Navegación principal">
            <Link href="/campos" className="nav-link">
              {regionalText(activeCountry, "Campos", "Terras")}
            </Link>
            <Link href="/servicios-rurales" className="nav-link">
              {regionalText(activeCountry, "Servicios rurales", "Serviços rurais")}
            </Link>
            <Link href="/#como-funciona" className="nav-link">
              {regionalText(activeCountry, "Cómo funciona", "Como funciona")}
            </Link>
            
          </nav>

          {/* Acciones desktop */}
          <div className="navbar-actions navbar-desktop">
            <div className="navbar-country-switch" aria-label="Seleccionar país">
              <select aria-label="Seleccionar país" disabled={!countrySelectReady} value={activeCountry} onChange={(event) => cambiarPais(event.target.value as CountryCode)} style={{background:"#fff",color:"#111",borderRadius:"20px",padding:"7px 9px",fontWeight:700,cursor:"pointer",maxWidth:"174px"}}>
                {COUNTRY_CODES_ALPHABETICAL.map((code) => <option key={code} value={code}>{COUNTRIES[code].name}</option>)}
              </select>
            </div>
            {user ? (
              <>
                <Link
                  href="/mensajes"
                  className={`navbar-mensajes ${enMensajes ? "active" : ""}`}
                  title={
                    noLeidos > 0 ? `${noLeidos} mensajes sin leer` : "Mensajes"
                  }
                  aria-label={
                    noLeidos > 0 ? `Mensajes, ${noLeidos} sin leer` : "Mensajes"
                  }
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
                  {regionalText(activeCountry, "Mi cuenta", "Minha conta")}
                </Link>
                <button onClick={handleLogout} className="btn-ghost">
                  {regionalText(activeCountry, "Salir", "Sair")}
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-ghost">
                  {regionalText(activeCountry, "Ingresar", "Entrar")}
                </Link>
                <Link href={`/register?pais=${activeCountry}&tipo=propietario`} className="btn-primary">
                  {regionalText(activeCountry, "Publicar campo", "Anunciar terra")}
                </Link>
              </>
            )}
          </div>

          {/* Header mobile: país a la izquierda, menú de usuario al extremo derecho */}
          <div className="navbar-mobile-right">
            <div className="navbar-country-switch navbar-country-switch-mobile" aria-label="Seleccionar país">
              <select aria-label="Seleccionar país" disabled={!countrySelectReady} value={activeCountry} onChange={(event) => cambiarPais(event.target.value as CountryCode)} style={{background:"#fff",color:"#111",borderRadius:"20px",padding:"7px",fontWeight:700,maxWidth:"145px"}}>
                {COUNTRY_CODES_ALPHABETICAL.map((code) => <option key={code} value={code}>{COUNTRIES[code].name}</option>)}
              </select>
            </div>
            <button type="button" className="navbar-mobile-account" aria-label="Mi cuenta y navegación" aria-expanded={menuAbierto} aria-controls="navbar-mobile-menu" onClick={() => setMenuAbierto((open) => !open)}>{regionalText(activeCountry, "Mi cuenta", "Minha conta")}</button>
            {user && (
              <Link
                href="/mensajes"
                className={`navbar-mensajes ${enMensajes ? "active" : ""}`}
                title={
                  noLeidos > 0 ? `${noLeidos} mensajes sin leer` : "Mensajes"
                }
                aria-label={
                  noLeidos > 0 ? `Mensajes, ${noLeidos} sin leer` : "Mensajes"
                }
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
        <div id="navbar-mobile-menu" className="mobile-menu" onClick={() => setMenuAbierto(false)}>
          <div
            className="mobile-menu-inner"
            onClick={(e) => e.stopPropagation()}
          >
            <nav
              className="mobile-menu-nav"
              onClick={() => setMenuAbierto(false)}
            >
              <Link href="/campos" className="mobile-menu-link">
                🌾 {regionalText(activeCountry, "Campos", "Terras")}
              </Link>
              <Link href="/servicios-rurales" className="mobile-menu-link">
                🚜 {regionalText(activeCountry, "Servicios rurales", "Serviços rurais")}
              </Link>
              <Link href="/#como-funciona" className="mobile-menu-link">
                ℹ️ {regionalText(activeCountry, "Cómo funciona", "Como funciona")}
              </Link>
              

              <div className="mobile-menu-sep" />

              {user ? (
                <>
                  <Link href="/dashboard" className="mobile-menu-link">
                    👤 {regionalText(activeCountry, "Mi cuenta", "Minha conta")}
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
                    ⚙️ {regionalText(activeCountry, "Mi perfil", "Meu perfil")}
                  </Link>

                  <div className="mobile-menu-sep" />

                  <button
                    onClick={handleLogout}
                    className="mobile-menu-link mobile-menu-logout"
                  >
                    {regionalText(activeCountry, "Cerrar sesión", "Sair da conta")}
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="mobile-menu-link">
                    {regionalText(activeCountry, "Ingresar", "Entrar")}
                  </Link>
                  <Link href={`/register?pais=${activeCountry}&tipo=propietario`} className="mobile-menu-btn">
                    {regionalText(activeCountry, "Publicar campo gratis", "Anunciar gratuitamente")}
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

export default function Navbar() {
  return <Suspense fallback={null}><NavbarContent /></Suspense>;
}
