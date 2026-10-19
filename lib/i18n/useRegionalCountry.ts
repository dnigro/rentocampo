"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { isCountryCode, resolveCountry, type CountryCode } from "@/data/countries";

const CHANGE_EVENT = "rentocampo:country-change";

function detectRegionalCountry(): CountryCode {
  const query = new URLSearchParams(window.location.search).get("pais");
  const cookie = document.cookie.split("; ").find((value) => value.startsWith("rentocampo_country="))?.split("=")[1];
  const saved = window.localStorage.getItem("rentocampo_country");
  const country = resolveCountry(query, isCountryCode(cookie) ? cookie : saved);
  if (isCountryCode(query)) {
    document.cookie = `rentocampo_country=${country}; path=/; max-age=31536000; SameSite=Lax`;
    window.localStorage.setItem("rentocampo_country", country);
  }
  document.documentElement.lang = country === "BR" ? "pt-BR" : "es";
  return country;
}

export function useRegionalCountry(): CountryCode {
  const pathname = usePathname();
  const [country, setCountry] = useState<CountryCode>("AR");
  useEffect(() => {
    const sync = () => setCountry(detectRegionalCountry());
    const id = window.setTimeout(sync, 0);
    window.addEventListener("storage", sync);
    window.addEventListener(CHANGE_EVENT, sync);
    window.addEventListener("popstate", sync);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener("storage", sync);
      window.removeEventListener(CHANGE_EVENT, sync);
      window.removeEventListener("popstate", sync);
    };
  }, [pathname]);
  return country;
}

export function selectRegionalCountry(country: CountryCode): void {
  // Update the URL before notifying subscribers: the previous order
  // read the stale ?pais value and reverted the first user selection.
  const destination = new URL(window.location.href);
  destination.searchParams.set("pais", country);
  for (const filter of ["provincia", "departamento", "region", "localidad"]) {
    destination.searchParams.delete(filter);
  }
  window.history.replaceState(
    window.history.state,
    "",
    `${destination.pathname}${destination.search}${destination.hash}`,
  );
  window.localStorage.setItem("rentocampo_country", country);
  document.cookie = `rentocampo_country=${country}; path=/; max-age=31536000; SameSite=Lax`;
  document.documentElement.lang = country === "BR" ? "pt-BR" : "es";
  window.dispatchEvent(new Event(CHANGE_EVENT));
}
