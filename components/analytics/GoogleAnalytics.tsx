"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

// RentoCampo production GA4 stream. Keep this explicit so a missing or stale
// Vercel environment variable cannot silently disable analytics.
const GA_ID = "G-PFGVKEFPCJ";

export default function GoogleAnalytics() {
  const pathname = usePathname();
  const isInitialRender = useRef(true);
  const lastTrackedPath = useRef<string | null>(null);

  function trackPageView() {
    if (typeof window === "undefined" || !window.gtag) return;

    const pagePath = `${window.location.pathname}${window.location.search}`;
    if (lastTrackedPath.current === pagePath) return;

    window.gtag("event", "page_view", {
      page_path: pagePath,
      page_location: window.location.href,
      page_title: document.title,
    });

    lastTrackedPath.current = pagePath;
  }

  useEffect(() => {
    // The initial page view is sent by gtag('config'). Only send explicit
    // page_view events for client-side route changes.
    if (isInitialRender.current) {
      isInitialRender.current = false;
      lastTrackedPath.current = `${window.location.pathname}${window.location.search}`;
      return;
    }

    trackPageView();
  }, [pathname]);

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${GA_ID}', {
            send_page_view: true
          });
        `}
      </Script>
    </>
  );
}
