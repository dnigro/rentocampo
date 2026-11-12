"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = { photos: string[]; title: string; href: string };
export default function V3CardPhotos({ photos, title, href }: Props) {
  const [active, setActive] = useState(0);
  const visible = photos.slice(0, 8);
  const index = Math.min(active, Math.max(0, visible.length - 1));
  return <>
    <Link href={href} aria-label={`Ver ${title}`}>
      {visible.length ? <Image src={visible[index]} alt={`${title} · foto ${index + 1}`} fill sizes="(max-width: 600px) 95vw, (max-width: 1023px) 45vw, 30vw"/> : <div className="v3-listing-placeholder">Fotografía no disponible</div>}
    </Link>
    {visible.length > 1 && <>
      <button type="button" className="v3-card-photo-prev" aria-label={`Foto anterior de ${title}`} onClick={() => setActive((index + visible.length - 1) % visible.length)}><ChevronLeft size={18}/></button>
      <button type="button" className="v3-card-photo-next" aria-label={`Foto siguiente de ${title}`} onClick={() => setActive((index + 1) % visible.length)}><ChevronRight size={18}/></button>
      <span className="v3-card-photo-count" aria-live="polite">{index + 1} / {visible.length}</span>
    </>}
  </>;
}
