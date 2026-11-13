import { isV3Enabled } from "@/lib/v3-routing";
import V3Layout from "@/app/v3/layout";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (isV3Enabled(process.env)) {
    return <V3Layout>{children}</V3Layout>;
  }
  return (
    <div className="app-shell">
      <Navbar />
      <main className="main-content">{children}</main>
      <Footer />
    </div>
  );
}
