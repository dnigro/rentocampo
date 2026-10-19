"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { COUNTRIES, COUNTRY_CODES, type CountryCode } from "@/data/countries";
import { regionalText } from "@/lib/i18n/regional";
import { selectRegionalCountry, useRegionalCountry } from "@/lib/i18n/useRegionalCountry";

/** Header compartido por todas las rutas /lite; mismo orden visual que web móvil. */
export default function LiteHeader() {
  const router = useRouter();
  const country = useRegionalCountry();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [supabase] = useState(createClient);

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, [supabase]);

  function changeCountry(next: CountryCode) {
    setMenuOpen(false);
    if (next === country) return;
    selectRegionalCountry(next);
    router.refresh();
  }

  async function logout() {
    await supabase.auth.signOut();
    setMenuOpen(false);
    router.push("/lite");
    router.refresh();
  }

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="lite-regional-header">
      <Link href="/lite" className="lite-regional-logo" aria-label="RentoCampo Lite - Inicio">
        <span className="lite-regional-initial">R</span>ento<span className="lite-regional-initial">C</span>ampo
      </Link>

      <div className="lite-regional-controls">
        <select
          className="lite-regional-country"
          aria-label="Seleccionar país"
          value={country}
          onChange={(event) => changeCountry(event.target.value as CountryCode)}
        >
          {COUNTRY_CODES.map((code) => (
            <option value={code} key={code}>
              {COUNTRIES[code].flag} {code}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="lite-regional-account"
          aria-controls="lite-regional-user-menu"
          aria-expanded={menuOpen}
          aria-label="Mi cuenta y navegación"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {regionalText(country, "Mi cuenta", "Minha conta")}
        </button>
      </div>

      {menuOpen && (
        <nav id="lite-regional-user-menu" className="lite-regional-menu" aria-label="Navegación de usuario">
          <Link onClick={closeMenu} href="/lite">{regionalText(country, "Inicio", "Início")}</Link>
          <Link onClick={closeMenu} href="/lite/campos">{regionalText(country, "Campos", "Terras")}</Link>
          <Link onClick={closeMenu} href="/lite/servicios">{regionalText(country, "Servicios rurales", "Serviços rurais")}</Link>
          <Link onClick={closeMenu} href="/lite/perfil">{regionalText(country, "Mi perfil", "Meu perfil")}</Link>
          {user ? (
            <>
              <Link onClick={closeMenu} href="/lite/perfil/mensajes">{regionalText(country, "Mensajes", "Mensagens")}</Link>
              <button type="button" onClick={() => void logout()}>{regionalText(country, "Cerrar sesión", "Sair da conta")}</button>
            </>
          ) : (
            <>
              <Link onClick={closeMenu} href="/lite/cuenta/ingresar">{regionalText(country, "Ingresar", "Entrar")}</Link>
              <Link onClick={closeMenu} href="/lite/cuenta/registro">{regionalText(country, "Registrarse", "Cadastrar-se")}</Link>
            </>
          )}
        </nav>
      )}
    </header>
  );
}
