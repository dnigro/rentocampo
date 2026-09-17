import { Bebas_Neue, DM_Sans } from "next/font/google";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import "@/styles/site-theme.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://rentocampo.com"),
  title: "RentoCampo | Tierra, productores y servicios rurales",
  description:
    "Tierra productiva, productores y servicios rurales en una red federal. Mapa, publicaciones y chat online gratis.",
  applicationName: "RentoCampo",
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
});

const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${dmSans.variable} ${bebasNeue.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "RentoCampo",
              url: "https://rentocampo.com",
              logo: "https://rentocampo.com/icon.png",
              description:
                "Plataforma argentina que conecta tierra productiva, productores y servicios rurales.",
              sameAs: [
                "https://www.instagram.com/rento_campo",
                "https://www.facebook.com/rentocampo",
              ],
            }).replace(/</g, "\\u003c"),
          }}
        />
      </head>
      <body style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
