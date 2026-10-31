"use client";

import { useEffect, useState, type CSSProperties } from "react";

/** Use the stored image when available; gracefully fall back to an existing public asset. */
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
  const safe = (value?: string | null) => {
    const v = value?.trim() ?? "";
    return v.startsWith("/") && !v.startsWith("//") || /^https:\/\//i.test(v) ? v : fallback;
  };
  const [current, setCurrent] = useState(() => safe(src));
  useEffect(() => setCurrent(safe(src)), [src, fallback]);
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
  return <img
    key={current}
    src={current}
    alt={alt}
    loading={eager ? "eager" : "lazy"}
    decoding="async"
    width={280}
    height={180}
    style={frame}
    onError={() => setCurrent(prev => prev === fallback ? "" : fallback)}
  />;
}
