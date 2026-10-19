"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useSyncExternalStore, type ReactNode } from "react";
import { resolveCountry, type CountryCode } from "@/data/countries";

type Props = { href: string; className?: string; children: ReactNode; fallbackCountry?: CountryCode };
const subscribe = (listener: () => void) => {
  window.addEventListener("storage", listener);
  window.addEventListener("rentocampo:country-change", listener);
  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener("rentocampo:country-change", listener);
  };
};
const savedCountry = () => resolveCountry(document.cookie.split("; ").find((item) => item.startsWith("rentocampo_country="))?.split("=")[1]);

function countryHref(href: string, country: CountryCode) {
  const [path, query] = href.split("?");
  const params = new URLSearchParams(query);
  params.set("pais", country);
  return `${path}?${params}`;
}

function ResolvedLink({ href, className, children, fallbackCountry = "AR" }: Props) {
  const params = useSearchParams();
  const saved = useSyncExternalStore(subscribe, savedCountry, () => fallbackCountry);
  const country = resolveCountry(params.get("pais"), saved);
  return <Link href={countryHref(href, country)} className={className}>{children}</Link>;
}

export default function RegionalLink(props: Props) {
  return <Suspense fallback={<Link href={countryHref(props.href, props.fallbackCountry ?? "AR")} className={props.className}>{props.children}</Link>}>
    <ResolvedLink {...props} />
  </Suspense>;
}
