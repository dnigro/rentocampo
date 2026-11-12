"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LayoutDashboard, UserRound, Heart, MessageCircle, ClipboardList, ShieldCheck, ArrowUpRight, MapPin } from "lucide-react";

const sections = [
  { key: "resumen", label: "Resumen", icon: LayoutDashboard },
  { key: "publicaciones", label: "Mis publicaciones", icon: ClipboardList },
  { key: "mensajes", label: "Mensajes", icon: MessageCircle },
  { key: "favoritos", label: "Favoritos", icon: Heart },
  { key: "perfil", label: "Mi perfil", icon: UserRound }
] as const;
type SectionKey = (typeof sections)[number]["key"];

export default function V3Cuenta() {
  const [active, setActive] = useState<SectionKey>("resumen");
  const [favCount, setFavCount] = useState(0);
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const stored: unknown = JSON.parse(sessionStorage.getItem("rentocampo_v3_uat_favs") || "[]");
        if (Array.isArray(stored)) setFavCount(stored.filter(x => typeof x === "string").length);
      } catch { /* Safari private browsing or disabled storage */ }
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);
  return <div className="v3-account-page">
    <header className="v3-account-heading"><span className="v3-kicker">TU ESPACIO RURAL</span>
      <h1>Mi RentoCampo</h1><p>Un espacio para tus oportunidades, publicaciones y conversaciones.</p>
    </header>
    <div className="v3-account-layout">
      <nav className="v3-account-sidebar" aria-label="Secciones de mi cuenta">
        {sections.map(item => <button key={item.key} type="button" className={active === item.key ? "active" : ""}
            onClick={() => setActive(item.key)} aria-current={active === item.key ? "page" : undefined}>
          <item.icon size={19}/>{item.label}
        </button>)}
      </nav>
      <section className="v3-account-section">
        {active === "resumen" && <>
          <h2>Tu panel de control</h2><p className="v3-account-subtext">Una vista más clara de tu actividad rural.</p>
          <div className="v3-account-stats">
            <div><ClipboardList size={25}/><strong>—</strong><span>Publicaciones reales</span></div>
            <div><MessageCircle size={25}/><strong>—</strong><span>Mensajes reales</span></div>
            <div><Heart size={25}/><strong>{favCount}</strong><span>Favoritos de UAT</span></div>
          </div>
          <div className="v3-account-callout"><MapPin size={28}/><div><h3>Explorá nuevas oportunidades</h3><p>Descubrí campos y servicios desde el nuevo marketplace.</p></div>
            <Link href="/v3/campos">Explorar campos <ArrowUpRight size={17}/></Link></div>
        </>}
        {active !== "resumen" && <>
          <div className="v3-account-empty">
            {active === "publicaciones" && <ClipboardList size={37}/>}
            {active === "mensajes" && <MessageCircle size={37}/>}
            {active === "favoritos" && <Heart size={37}/>}
            {active === "perfil" && <UserRound size={37}/>}
            <h2>{sections.find(item => item.key === active)?.label}</h2>
            <p>{active === "favoritos" ? `Guardaste ${favCount} publicaciones para la revisión visual. Este estado no está sincronizado con tu cuenta.`
              : "La información real de esta sección se habilitará cuando esté conectado el entorno aislado de autenticación y datos para UAT."}</p>
            {active === "favoritos" && <Link className="v3-primary-link" href="/v3/campos">Explorar y guardar campos <ArrowUpRight size={16}/></Link>}
          </div>
        </>}
        <div className="v3-account-security"><ShieldCheck size={20}/> Modo UAT de solo lectura. No se modifican cuentas, mensajes ni publicaciones productivas.</div>
      </section>
    </div>
  </div>;
}
