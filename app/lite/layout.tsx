import type { Metadata } from "next";
import Footer from "@/components/layout/Footer";
import "@/styles/lite-header.css";

export const metadata: Metadata = {
  // Lite ofrece otra interfaz al mismo catálogo: no competir con las páginas SEO.
  robots: { index: false, follow: true },
};

/** Reutiliza exactamente el footer público para web, móvil y App Lite. */
export default function LiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="lite-app" style={{ minHeight: "100dvh", background: "#f7f7f5" }}>
      {children}
      <div className="lite-app-footer">
        <Footer />
      </div>
    </div>
  );
}
