import LandingFigmaHome from "@/components/landing/LandingFigmaHome";
import LandingFAQ from "@/components/landing/LandingFAQ";
import HowItWorksStrip from "@/components/landing/HowItWorksStrip";

// Home minimal: hero + cómo funciona breve + preguntas frecuentes. El header y el footer
// siguen en app/page.tsx, fuera de este contenido.
export default function LandingPageContent() {
  return (
    <main className="rc-landing">
      <LandingFigmaHome />
      <HowItWorksStrip />
      <LandingFAQ />
    </main>
  );
}
