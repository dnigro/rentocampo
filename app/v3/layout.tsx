import type { Metadata } from "next";
import PreviewSiteFrame from "@/components/layout/PreviewSiteFrame";
export const metadata: Metadata = { title: "RentoCampo V3 | Vista previa", robots: { index: false, follow: false } };
export default function V3Layout({ children }: { children: React.ReactNode }) {
 return <PreviewSiteFrame>{children}</PreviewSiteFrame>;
}
