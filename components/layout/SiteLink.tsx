"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";
import { siteSurfaceHref } from "@/lib/site-surface";

export default function SiteLink({ href, ...props }: ComponentProps<typeof NextLink>) {
  const lite = usePathname().startsWith("/lite");
  return <NextLink {...props} href={typeof href === "string" ? siteSurfaceHref(href, lite) : href} />;
}
