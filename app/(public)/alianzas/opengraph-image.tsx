import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "RentoCampo — Alianzas rurales gratuitas. Más oportunidades para tu comunidad.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#10283d", color: "#ffffff", padding: "62px 76px", justifyContent: "space-between", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
        <div style={{ display: "flex", width: 86, height: 86, border: "3px solid #ffffff", borderRadius: 18, alignItems: "center", justifyContent: "center", fontSize: 37, fontWeight: 800 }}>RC</div>
        <div style={{ display: "flex", fontSize: 48, fontWeight: 800, letterSpacing: -2 }}>RentoCampo</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "flex", fontSize: 22, letterSpacing: 4, color: "#c2d4df", fontWeight: 700 }}>ALIANZAS RURALES</div>
        <div style={{ display: "flex", fontSize: 66, fontWeight: 800, lineHeight: 1.08, maxWidth: 1000 }}>Más oportunidades para tu comunidad.</div>
        <div style={{ display: "flex", fontSize: 29, color: "#d7e3ea" }}>Publicá campos y servicios rurales gratis. Contacto directo.</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "2px solid #456276", paddingTop: 22 }}>
        <div style={{ display: "flex", fontSize: 25, fontWeight: 700 }}>El campo. Sin vueltas.</div>
        <div style={{ display: "flex", fontSize: 25 }}>rentocampo.com/alianzas</div>
      </div>
    </div>,
    size
  );
}
