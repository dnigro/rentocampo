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

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "G-PFGVKEFPCJ";

export default function GoogleAnalytics() {
  const pathname = usePathname();
  const isInitialRender = useRef(true);
  const lastTrackedPath = useRef<string | null>(null);

  function trackPageView() {
    if (!GA_ID || typeof window === "undefined" || !window.gtag) return;

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
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }

    trackPageView();
  }, [pathname]);

  if (!GA_ID) return null;

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
            send_page_view: false
          });
          gtag('event', 'page_view', {
            page_path: window.location.pathname + window.location.search,
            page_location: window.location.href,
            page_title: document.title
          });
        `}
      </Script>
    </>
  );
}
