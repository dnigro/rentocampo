"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { COUNTRIES, COUNTRY_CODES, isCountryCode, type CountryCode } from "@/data/countries";

/** Header compartido por todas las rutas /lite; mismo orden visual que web móvil. */
export default function LiteHeader() {
  const router = useRouter();
  const [country, setCountry] = useState<CountryCode>("AR");
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [supabase] = useState(createClient);

  useEffect(() => {
    const saved = window.localStorage.getItem("rentocampo_country");
    const resolved: CountryCode = isCountryCode(saved) ? saved : "AR";
    const syncCountry = window.setTimeout(() => setCountry(resolved), 0);
    return () => window.clearTimeout(syncCountry);
  }, []);

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, [supabase]);

  function changeCountry(next: CountryCode) {
    setCountry(next);
    setMenuOpen(false);
    window.localStorage.setItem("rentocampo_country", next);
    document.cookie = `rentocampo_country=${next}; path=/; max-age=31536000; SameSite=Lax`;
    // El mapa regional ya soporta AR/UY/PY. Los listados Lite siguen en evolución.
    router.push(`/campos/mapa?pais=${next}`);
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
          Mi cuenta
        </button>
      </div>

      {menuOpen && (
        <nav id="lite-regional-user-menu" className="lite-regional-menu" aria-label="Navegación de usuario">
          <Link onClick={closeMenu} href="/lite">Inicio</Link>
          <Link onClick={closeMenu} href="/lite/campos">Campos</Link>
          <Link onClick={closeMenu} href="/lite/servicios">Servicios rurales</Link>
          <Link onClick={closeMenu} href="/lite/perfil">Mi perfil</Link>
          {user ? (
            <>
              <Link onClick={closeMenu} href="/lite/perfil/mensajes">Mensajes</Link>
              <button type="button" onClick={() => void logout()}>Cerrar sesión</button>
            </>
          ) : (
            <>
              <Link onClick={closeMenu} href="/lite/cuenta/ingresar">Ingresar</Link>
              <Link onClick={closeMenu} href="/lite/cuenta/registro">Registrarse</Link>
            </>
          )}
        </nav>
      )}
    </header>
  );
}
