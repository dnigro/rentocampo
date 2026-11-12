import V3Layout from "@/app/v3/layout";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (process.env.VERCEL_ENV === "preview" && process.env.VERCEL_GIT_COMMIT_REF === "feature/rentocampo-v3") {
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
