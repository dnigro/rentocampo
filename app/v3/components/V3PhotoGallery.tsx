"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X, Images } from "lucide-react";

type Props = { photos: string[]; title: string };
export default function V3PhotoGallery({ photos, title }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const [active, setActive] = useState(0);
  const visible = photos.slice(0, 8);
  const index = Math.min(active, Math.max(0, visible.length - 1));
  const move = (delta: number) => setActive(previous => (Math.min(previous, visible.length - 1) + delta + visible.length) % visible.length);
  const open = (index: number) => {
    setActive(index);
    dialog.current?.showModal();
    closeButton.current?.focus();
  };
  if (!visible.length) return <div className="v3-detail-gallery-empty">Esta publicación todavía no tiene fotografías disponibles.</div>;
  return <>
    <div className="v3-gallery-preview">
      <div className={`v3-detail-gallery v3-gallery-count-${Math.min(visible.length, 5)}`}>
        {visible.slice(0, 5).map((src, index) => <button type="button" key={`${src}-${index}`} className="v3-detail-gallery-image" onClick={() => open(index)} aria-label={`Abrir foto ${index + 1} de ${visible.length} de ${title}`}>
          <Image src={src} fill alt={`Imagen ${index + 1} de ${title}`} sizes="(max-width: 700px) 95vw, (max-width: 1100px) 50vw, 33vw" priority={index === 0}/>
        </button>)}
      </div>
      <button type="button" className="v3-gallery-show-all" onClick={() => open(0)}><Images size={17}/> Ver {visible.length} {visible.length === 1 ? "foto" : "fotos"}</button>
    </div>
    <dialog ref={dialog} className="v3-photo-dialog" aria-label={`Fotos de ${title}`} onKeyDown={event => {
      if (event.key === "ArrowRight") { event.preventDefault(); move(1); }
      if (event.key === "ArrowLeft") { event.preventDefault(); move(-1); }
    }}>
      <div className="v3-photo-dialog-header"><span aria-live="polite">Foto {index + 1} de {visible.length}</span><button ref={closeButton} type="button" onClick={() => dialog.current?.close()} aria-label="Cerrar galería"><X size={22}/></button></div>
      <div className="v3-photo-dialog-image"><Image src={visible[index]} alt={`Imagen ${index + 1} de ${title}`} fill sizes="95vw"/></div>
      {visible.length > 1 && <div className="v3-photo-dialog-controls"><button type="button" onClick={() => move(-1)} aria-label="Foto anterior"><ChevronLeft size={24}/></button><button type="button" onClick={() => move(1)} aria-label="Foto siguiente"><ChevronRight size={24}/></button></div>}
    </dialog>
  </>;
}
