import { Bebas_Neue, DM_Sans } from "next/font/google";
import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { cookies } from "next/headers";
import { resolveCountry } from "@/data/countries";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import "./globals.css";
import "@/styles/site-theme.css";
import "@/styles/buttons.css";

const SITE_URL = "https://rentocampo.com";
const SITE_TITLE = "RentoCampo | Tierra, productores y servicios rurales";
const SITE_DESCRIPTION =
  "Tierra productiva, productores y servicios rurales en una red federal. Mapa, publicaciones y chat online gratis.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  applicationName: "RentoCampo",
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  icons: {
    // Fuente única para el ícono del navegador y de resultados de Google.
    // El .ico es exactamente el escudo RC oficial (16/32/48/64 px).
    icon: [{ url: "/favicon.ico", type: "image/x-icon", sizes: "any" }],
    shortcut: "/favicon.ico",
    apple: "/icon-512.png",
  },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: "RentoCampo",
    type: "website",
    locale: "es_AR",
  },
  twitter: {
    card: "summary",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const country = resolveCountry((await cookies()).get("rentocampo_country")?.value);
  return (
    <html lang={country === "BR" ? "pt-BR" : country === "US" ? "en-US" : "es"} className={`${dmSans.variable} ${bebasNeue.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "RentoCampo",
              url: SITE_URL,
              logo: `${SITE_URL}/icon-512.png`,
              description:
                "Plataforma regional que conecta tierra productiva, productores y servicios rurales.",
              sameAs: [
                "https://www.instagram.com/rento_campo",
                "https://www.facebook.com/profile.php?id=61594630832899",
              ],
            }).replace(/</g, "\\u003c"),
          }}
        />
      </head>
      <body style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>
        <Suspense fallback={null}>
          <GoogleAnalytics />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
