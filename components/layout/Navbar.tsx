"use client";

import Link from "@/components/layout/SiteLink";
import Image from "next/image";
import { ArrowRight, ChevronDown, Menu, MessagesSquare, X, UserRound } from "lucide-react";
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
  const [countryMenuOpen, setCountryMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const lite = pathname.startsWith("/lite");
  const activeCountry = useRegionalCountry();
  const [supabase] = useState(createClient);

  // Prevent a native pre-hydration country change from being ignored.
  useEffect(() => {
    const id = window.setTimeout(() => setCountrySelectReady(true), 0);
    return () => window.clearTimeout(id);
  }, []);

  function cambiarPais(country: CountryCode) {
    // A full navigation is required here: a router.refresh() after changing
    // history via replaceState can leave the header on one country while the
    // server-rendered map still belongs to the previous country.
    selectRegionalCountry(country);
    window.location.reload();
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
    router.push(lite ? "/lite" : "/");
    router.refresh();
  }

  const enMensajes = pathname.startsWith(lite ? "/lite/perfil/mensajes" : "/mensajes");

  return (
    <>
      <header className="navbar navbar--home">
        <div className="navbar-inner">
          <Link href="/" className="navbar-logo" aria-label="RentoCampo - inicio">
            <Image src="/lite-logo.svg" alt="" width={37} height={41} priority className="navbar-brand-icon" />
            <span className="navbar-brand-title">RentoCampo</span>
          </Link>

          {/* Navegación principal compartida en todo el sitio */}
          <nav className="navbar-links" aria-label="Navegación principal">
            <Link href="/campos" className="nav-link">
              {regionalText(activeCountry, "Campos", "Terras")}
            </Link>
            <Link href="/servicios-rurales" className="nav-link">
              {regionalText(activeCountry, "Servicios rurales", "Serviços rurais")}
            </Link>
            
          </nav>

          {/* Acciones desktop */}
          <div className="navbar-actions navbar-desktop">
            <div className="navbar-country-switch" aria-label="Seleccionar país" style={{ background: "transparent", border: 0, padding: 0, gap: 8 }}>
              <label htmlFor="navbar-pais-desktop" style={{ color: "#102b3d", fontSize: 12, fontWeight: 850, letterSpacing: ".05em", whiteSpace: "nowrap" }}>{regionalText(activeCountry, "PAÍS", "PAÍS", "COUNTRY")}</label>
              <div style={{ position: "relative" }}>
                <button type="button" aria-label="Seleccionar país" aria-haspopup="listbox" aria-expanded={countryMenuOpen} disabled={!countrySelectReady} onClick={() => setCountryMenuOpen((open) => !open)} style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", color: "#111", border: 0, borderRadius: 20, padding: "9px 12px", fontWeight: 700, cursor: "pointer" }}>
                  {/* SVG flags render reliably on Windows, unlike emoji in native selects. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/flags/${activeCountry.toLowerCase()}.svg`} alt="" width={24} height={18} style={{ objectFit: "cover" }} />
                  {activeCountry} <ChevronDown size={16} strokeWidth={2.1} aria-hidden="true" />
                </button>
                {countryMenuOpen && (
                  <>
                    <button type="button" aria-label="Cerrar selector de país" onClick={() => setCountryMenuOpen(false)} style={{ position: "fixed", inset: 0, background: "transparent", border: 0, cursor: "default", zIndex: 98 }} />
                    <div role="listbox" aria-label="País" style={{ position: "absolute", top: "100%", right: 0, zIndex: 99, maxHeight: "65vh", overflowY: "auto", background: "#fff", color: "#111", minWidth: 190, borderRadius: 10, boxShadow: "0 8px 28px #0005", padding: "5px 0" }}>
                      {COUNTRY_CODES_ALPHABETICAL.map((code) => (
                        <button key={code} type="button" role="option" aria-selected={activeCountry === code} onClick={() => { setCountryMenuOpen(false); cambiarPais(code); }} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "9px 12px", background: activeCountry === code ? "#e5edf9" : "#fff", color: "#111", border: 0, textAlign: "left", cursor: "pointer", fontWeight: activeCountry === code ? 700 : 500 }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={`/flags/${code.toLowerCase()}.svg`} alt="" width={24} height={18} style={{ objectFit: "cover" }} />
                          {code} · {COUNTRIES[code].name}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
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
                  <MessagesSquare size={22} strokeWidth={2.15} aria-hidden="true" />
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
                  {regionalText(activeCountry, "Ingresar", "Entrar", "Sign in")}
                </Link>

              </>
            )}
          </div>

          {/* Header mobile: país a la izquierda, menú de usuario al extremo derecho */}
          <div className="navbar-mobile-right">
            <div className="navbar-country-switch navbar-country-switch-mobile" aria-label="Seleccionar país" style={{ gap: 6 }}>
              <label htmlFor="navbar-pais-mobile" style={{ color: "#182B3E", fontSize: 11, fontWeight: 850, letterSpacing: ".04em", whiteSpace: "nowrap" }}>{regionalText(activeCountry, "PAÍS", "PAÍS", "COUNTRY")}</label>
              <select id="navbar-pais-mobile" aria-label="Seleccionar país" disabled={!countrySelectReady} value={activeCountry} onChange={(event) => cambiarPais(event.target.value as CountryCode)} style={{ background: "#fff", color: "#111", borderRadius: "20px", padding: "7px", fontWeight: 700, minWidth: 84 }}>
                {COUNTRY_CODES_ALPHABETICAL.map((code) => <option key={code} value={code}>{COUNTRIES[code].flag} {code}</option>)}
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
                <MessagesSquare size={22} strokeWidth={2.15} aria-hidden="true" />
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
              aria-label={regionalText(activeCountry, "Abrir o cerrar menú", "Abrir ou fechar menu", "Open or close menu")}
              aria-controls="navbar-mobile-menu"
              aria-expanded={menuAbierto}
              type="button"
            >
              {menuAbierto ? <X size={24} strokeWidth={2.15} aria-hidden="true" /> : <Menu size={24} strokeWidth={2.15} aria-hidden="true" />}
            </button>
          </div>
        </div>

      </header>

      {/* Menú mobile overlay */}
      {menuAbierto && (
        <div id="navbar-mobile-menu" className="mobile-menu" onClick={() => setMenuAbierto(false)}>
          <div
            className="mobile-menu-inner rc-mobile-drawer"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label={regionalText(activeCountry, "Menú de RentoCampo", "Menu da RentoCampo", "RentoCampo menu")}
            aria-modal="true"
          >
            <div className="rc-mobile-drawer__head">
              <BrandWordmark className="rc-mobile-drawer__wordmark" />
              <button type="button" className="rc-mobile-drawer__close" onClick={() => setMenuAbierto(false)} aria-label="Cerrar menú">
                <X size={21} aria-hidden="true" />
              </button>
            </div>
            <div className="rc-mobile-drawer__account">
              <div className="rc-mobile-drawer__account-copy">
                <span className="rc-mobile-drawer__eyebrow">{regionalText(activeCountry, "TU ESPACIO RURAL", "SEU ESPAÇO RURAL", "YOUR RURAL SPACE")}</span>
                <strong>{user ? regionalText(activeCountry, "Tu cuenta RentoCampo", "Sua conta RentoCampo", "Your RentoCampo account") : regionalText(activeCountry, "Ingresá a tu cuenta", "Entre na sua conta", "Sign in to your account")}</strong>
                <p>{regionalText(activeCountry, "Gestioná campos, servicios y mensajes desde un solo lugar.", "Gerencie terras, serviços e mensagens em um só lugar.", "Manage land, services and messages in one place.")}</p>
                <Link href={user ? "/dashboard" : "/login"} onClick={() => setMenuAbierto(false)} className="rc-mobile-drawer__account-btn">
                  <UserRound size={17} aria-hidden="true" />
                  {user ? regionalText(activeCountry, "Ir a mi cuenta", "Ir para minha conta", "Go to my account") : regionalText(activeCountry, "Ingresar", "Entrar", "Sign in")}
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </div>
            </div>
            <nav
              className="mobile-menu-nav"
              aria-label={regionalText(activeCountry, "Navegación de cuenta", "Navegação da conta", "Account navigation")}
              onClick={() => setMenuAbierto(false)}
            >
              {user ? (
                // Las opciones de navegación ya viven dentro de Mi cuenta.
                // Evitamos duplicarlas en el desplegable de usuarios logueados.
                <button
                  type="button"
                  onClick={handleLogout}
                  className="mobile-menu-link mobile-menu-logout"
                >
                  {regionalText(activeCountry, "Cerrar sesión", "Sair da conta", "Log out")}
                </button>
              ) : (
                // El CTA de ingreso ya está en la tarjeta superior.
                // Para visitantes solo queda la acción principal de publicar.
                <Link href={`/register?pais=${activeCountry}&tipo=propietario`} className="mobile-menu-btn">
                  {regionalText(activeCountry, "Publicar campo gratis", "Anunciar gratuitamente", "List land for free")}
                </Link>
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
