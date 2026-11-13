"use client";

import { v3Text } from "@/lib/i18n/v3-copy";
import type { CountryCode } from "@/data/countries";
import Image from "next/image";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X, Images } from "lucide-react";

type Props = { country?: CountryCode; photos: string[]; title: string };
export default function V3PhotoGallery({ photos, title, country = "AR" }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const t = (source: string) => v3Text(country, source);
  const [active, setActive] = useState(0);
  const [failed, setFailed] = useState<Set<string>>(new Set());
  const fail = (src: string) => setFailed(previous => new Set(previous).add(src));
  const visible = photos.slice(0, 8);
  const index = Math.min(active, Math.max(0, visible.length - 1));
  const move = (delta: number) => setActive(previous => (Math.min(previous, visible.length - 1) + delta + visible.length) % visible.length);
  const open = (index: number) => {
    setActive(index);
    dialog.current?.showModal();
    closeButton.current?.focus();
  };
  if (!visible.length) return <div className="v3-detail-gallery-empty">{t("Esta publicación todavía no tiene fotografías disponibles.")}</div>;
  if (visible.every(src => failed.has(src))) return <div className="v3-detail-gallery-empty">{t("No pudimos cargar las fotografías de esta publicación.")}</div>;
  return <>
    <div className="v3-gallery-preview">
      <div className={`v3-detail-gallery v3-gallery-count-${Math.min(visible.length, 5)}`}>
        {visible.slice(0, 5).map((src, index) => <button type="button" key={`${src}-${index}`} className="v3-detail-gallery-image" onClick={() => open(index)} aria-label={`${t("Abrir foto")} ${index + 1}/${visible.length} · ${title}`}>
          {failed.has(src) ? <span className="v3-gallery-photo-error">{t("Fotografía no disponible")}</span> : <Image onError={() => fail(src)} src={src} fill alt={`${t("Imagen")} ${index + 1} · ${title}`} sizes="(max-width: 700px) 95vw, (max-width: 1100px) 50vw, 33vw" priority={index === 0}/>}
        </button>)}
      </div>
      <button type="button" className="v3-gallery-show-all" onClick={() => open(0)}><Images size={17}/> {t("Ver")} {visible.length} {visible.length === 1 ? t("foto") : t("fotos")}</button>
    </div>
    <dialog ref={dialog} className="v3-photo-dialog" aria-label={`${t("Fotos de")} ${title}`} onKeyDown={event => {
      if (event.key === "ArrowRight") { event.preventDefault(); move(1); }
      if (event.key === "ArrowLeft") { event.preventDefault(); move(-1); }
    }}>
      <div className="v3-photo-dialog-header"><span aria-live="polite">{t("Foto")} {index + 1} / {visible.length}</span><button ref={closeButton} type="button" onClick={() => dialog.current?.close()} aria-label={t("Cerrar galería")}><X size={22}/></button></div>
      <div className="v3-photo-dialog-image">{failed.has(visible[index]) ? <span className="v3-gallery-photo-error">{t("Fotografía no disponible")}</span> : <Image onError={() => fail(visible[index])} src={visible[index]} alt={`${t("Imagen")} ${index + 1} · ${title}`} fill sizes="95vw"/>}</div>
      {visible.length > 1 && <div className="v3-photo-dialog-controls"><button type="button" onClick={() => move(-1)} aria-label={t("Foto anterior")}><ChevronLeft size={24}/></button><button type="button" onClick={() => move(1)} aria-label={t("Foto siguiente")}><ChevronRight size={24}/></button></div>}
    </dialog>
  </>;
}
