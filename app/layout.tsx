import { Bebas_Neue, DM_Sans } from "next/font/google";
import type { Metadata, Viewport } from "next";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import "./globals.css";
import "@/styles/site-theme.css";

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
              url: SITE_URL,
              logo: `${SITE_URL}/icon.png`,
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
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  );
}
