import LandingFigmaHome from "@/components/landing/LandingFigmaHome";
import LandingFAQ from "@/components/landing/LandingFAQ";

// Home minimal: hero + preguntas frecuentes. El header y el footer
// siguen en app/page.tsx, fuera de este contenido.
export default function LandingPageContent() {
  return (
    <main className="rc-landing">
      <LandingFigmaHome />
      <LandingFAQ />
    </main>
  );
}
