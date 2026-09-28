"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Map, MessageCircle, Plus, UserRound } from "lucide-react";
import { useEffect } from "react";

const hiddenPrefixes = ["/login", "/register", "/recuperar", "/auth"];

export default function MobileAppNav() {
  const pathname = usePathname();
  const hidden = hiddenPrefixes.some((prefix) => pathname?.startsWith(prefix));

  useEffect(() => {
    document.body.classList.toggle("mobile-app-shell", !hidden);
    return () => document.body.classList.remove("mobile-app-shell");
  }, [hidden]);

  if (hidden) return null;

  const items = [
    { href: "/", label: "Inicio", icon: Home, active: pathname === "/" },
    {
      href: "/campos/mapa",
      label: "Mapa",
      icon: Map,
      active: pathname?.startsWith("/campos/mapa"),
    },
    {
      href: "/mis-campos/nuevo",
      label: "Publicar",
      icon: Plus,
      primary: true,
      active: pathname?.startsWith("/mis-campos/nuevo"),
    },
    {
      href: "/mensajes",
      label: "Mensajes",
      icon: MessageCircle,
      active: pathname?.startsWith("/mensajes"),
    },
    {
      href: "/perfil",
      label: "Perfil",
      icon: UserRound,
      active: pathname?.startsWith("/perfil"),
    },
  ];

  return (
    <nav className="mobile-app-nav" aria-label="Navegación de la app">
      <div className="mobile-app-nav__inner">
        {items.map(({ href, label, icon: Icon, active, primary }) => (
          <Link
            key={href}
            href={href}
            className={[
              "mobile-app-nav__item",
              active ? "is-active" : "",
              primary ? "is-primary" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            aria-current={active ? "page" : undefined}
          >
            <span className="mobile-app-nav__icon" aria-hidden="true">
              <Icon size={primary ? 26 : 22} strokeWidth={primary ? 2.4 : 2} />
            </span>
            <span>{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
