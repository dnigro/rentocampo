import type { Metadata } from "next";
import Link from "next/link";
import { MapPinned, UserRound, Sprout } from "lucide-react";
import "./v3.css";
export const metadata: Metadata = { title: "RentoCampo V3 | Vista previa", robots: { index: false, follow: false } };
export default function V3Layout({ children }: { children: React.ReactNode }) {
 return <div className="v3-shell">
  <header className="v3-header"><Link href="/" className="v3-brand"><span className="v3-shield">RC</span><span>Rento<span className="v3-brand-bold">Campo</span></span><small>V3</small></Link>
   <nav aria-label="Navegación V3"><Link href="/campos">Campos</Link><Link href="/servicios-rurales">Servicios rurales</Link><Link href="/dashboard">Mi RentoCampo</Link><Link href="/#como-funciona">Cómo funciona</Link></nav>
   <div className="v3-header-actions"><Link href="/v3/mi-rentocampo" className="v3-account"><UserRound size={18}/> Mi cuenta</Link><Link href="/publicar" className="v3-publish">Publicar gratis</Link></div>
  </header>
  <main>{children}</main>
  <footer className="v3-footer"><div><strong>RentoCampo</strong><p>El campo. Sin vueltas.</p></div><div><Link href="/v3/campos"><MapPinned size={15}/> Campos</Link><Link href="/v3/servicios"><Sprout size={15}/> Servicios</Link></div><span>Vista previa V3 · Sin reemplazar el sitio actual</span></footer>
 </div>;
}