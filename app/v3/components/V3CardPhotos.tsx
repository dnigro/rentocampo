"use client";

import { v3Text } from "@/lib/i18n/v3-copy";
import type { CountryCode } from "@/data/countries";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = { country?: CountryCode; photos: string[]; title: string; href: string; fallbackPhoto?: string };
export default function V3CardPhotos({ photos, title, href, country = "AR", fallbackPhoto }: Props) {
  const t = (source: string) => v3Text(country, source);
  const [active, setActive] = useState(0);
  const [failed, setFailed] = useState<Set<string>>(new Set());
  const candidates=photos.slice(0,8);
  if(fallbackPhoto && !candidates.includes(fallbackPhoto) && (!candidates.length || candidates.every(src=>failed.has(src)))) candidates.push(fallbackPhoto);
  const visible = candidates.filter(src => !failed.has(src));
  const index = Math.min(active, Math.max(0, visible.length - 1));
  return <>
    <Link href={href} aria-label={`${t("Ver")} ${title}`}>
      {visible.length ? <Image onError={() => setFailed(previous => new Set(previous).add(visible[index]))} src={visible[index]} alt={`${title} · ${t("foto")} ${index + 1}`} fill sizes="(max-width: 600px) 95vw, (max-width: 1023px) 45vw, 30vw"/> : <div className="v3-listing-placeholder">{t("Fotografía no disponible")}</div>}
    </Link>
    {visible.length > 1 && <>
      <button type="button" className="v3-card-photo-prev" aria-label={`${t("Foto anterior")}: ${title}`} onClick={() => setActive((index + visible.length - 1) % visible.length)}><ChevronLeft size={18}/></button>
      <button type="button" className="v3-card-photo-next" aria-label={`${t("Foto siguiente")}: ${title}`} onClick={() => setActive((index + 1) % visible.length)}><ChevronRight size={18}/></button>
      <span className="v3-card-photo-count" aria-live="polite">{index + 1} / {visible.length}</span>
    </>}
  </>;
}
