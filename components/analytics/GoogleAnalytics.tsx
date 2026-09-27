"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const GA_ID = "G-PFGVKEFPCJ";
const PROD_HOSTS = new Set(["rentocampo.com", "www.rentocampo.com"]);
const isProductionHost = () =>
  typeof window !== "undefined" && PROD_HOSTS.has(window.location.hostname);

function getPageGroup(pathname: string) {
  if (pathname.startsWith("/alquiler-de-campos/buenos-aires")) return "alquiler_buenos_aires";
  if (pathname.startsWith("/alquiler-de-campos/cordoba")) return "alquiler_cordoba";
  if (pathname.startsWith("/alquiler-de-campos/santa-fe")) return "alquiler_santa_fe";
  if (pathname.startsWith("/alquiler-de-campos")) return "alquiler_campos";
  if (pathname.startsWith("/servicios")) return "servicios_rurales";
  if (pathname.startsWith("/campos")) return "campos";
  if (pathname === "/") return "home";
  return "otras";
}

export default function GoogleAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedPath = useRef<string | null>(null);

  const trackPageView = useCallback(() => {
    if (!isProductionHost() || !window.gtag) return;

    const pagePath = `${window.location.pathname}${window.location.search}`;
    if (lastTrackedPath.current === pagePath) return;

    window.gtag("event", "page_view", {
      page_path: pagePath,
      page_location: window.location.href,
      page_title: document.title,
      page_group: getPageGroup(window.location.pathname),
      site_environment: "production",
    });

    lastTrackedPath.current = pagePath;
  }, []);

  useEffect(() => {
    trackPageView();
  }, [pathname, searchParams, trackPageView]);

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
        onLoad={trackPageView}
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          if (["rentocampo.com", "www.rentocampo.com"].includes(window.location.hostname)) {
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('js', new Date());
            gtag('config', '${GA_ID}', {
              send_page_view: false,
              cookie_flags: 'SameSite=None;Secure'
            });
          }
        `}
      </Script>
    </>
  );
}
