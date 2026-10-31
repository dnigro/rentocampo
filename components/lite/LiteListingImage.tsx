"use client";

import Image from "next/image";
import { useState, type CSSProperties } from "react";

/** Resilient photo display for web / mobile / App Lite, with no broken-image glyph. */
export default function LiteListingImage({
  src,
  alt,
  fallback = "/rentocampo-hero-campo-bn-1920x1080.webp",
  eager = false,
  style,
}: {
  src?: string | null;
  alt: string;
  fallback?: string;
  eager?: boolean;
  style?: CSSProperties;
}) {
  const value = src?.trim() ?? "";
  const validUrl = (value.startsWith("/") && !value.startsWith("//")) || /^https:\/\//i.test(value);
  const primary = validUrl ? value : fallback;
  const [failed, setFailed] = useState<string[]>([]);
  const current = failed.includes(primary)
    ? (failed.includes(fallback) ? "" : fallback)
    : primary;
  const frame: CSSProperties = {
    display: "block",
    width: "100%",
    height: "100%",
    minHeight: 110,
    objectFit: "cover",
    objectPosition: "center",
    borderRadius: 10,
    background: "#e5eae6",
    ...style,
  };
  if (!current) {
    return <div role="img" aria-label={alt} style={{
      ...frame, display: "grid", placeItems: "center",
      color: "#4b6054", fontSize: 12, fontWeight: 700,
    }}>Sin imagen</div>;
  }
  return <Image
    unoptimized
    src={current}
    alt={alt}
    loading={eager ? "eager" : "lazy"}
    width={280}
    height={180}
    style={frame}
    onError={() => setFailed(prev => prev.includes(current) ? prev : [...prev, current])}
  />;
}
