import Link from "next/link";

export default function FichaVisualNav({ fotos = true }: { fotos?: boolean }) {
  return (
    <nav className="rc-ficha-visual-nav" aria-label="Secciones de la publicación">
      {fotos && <Link href="#ficha-fotos">Fotos <span aria-hidden="true">↗</span></Link>}
      <Link href="#ficha-detalles">Detalles <span aria-hidden="true">↓</span></Link>
      <Link href="#ficha-contacto" className="rc-ficha-visual-nav-contact">Consultar <span aria-hidden="true">→</span></Link>
    </nav>
  );
}
