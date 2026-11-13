import { isV3Preview } from "@/lib/v3-routing";
import type { Metadata } from "next";
import PreviewSiteFrame from "@/components/layout/PreviewSiteFrame";
export const metadata: Metadata = { title: isV3Preview(process.env) ? "RentoCampo V3 | Vista previa" : "RentoCampo", ...(process.env.VERCEL_ENV !== "production" || isV3Preview(process.env) ? { robots: { index: false, follow: false } } : {}) };
export default function V3Layout({ children }: { children: React.ReactNode }) {
 return <PreviewSiteFrame>{children}</PreviewSiteFrame>;
}
