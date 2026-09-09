import LandingHero from "@/components/landing/LandingHero";
import LandingActividad from "@/components/landing/LandingActividad";
import LandingComo from "@/components/landing/LandingComo";
import LandingFAQ from "@/components/landing/LandingFAQ";
import LandingCTA from "@/components/landing/LandingCTA";

export default function LandingPageContent() {
  return (
    <main className="rc-landing">
      <LandingHero />
      <LandingActividad />
      <LandingComo />
      <LandingFAQ />
      <LandingCTA />
    </main>
  );
}
