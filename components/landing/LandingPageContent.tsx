import LandingTriptychHero from "@/components/landing/LandingTriptychHero";
import LandingComo from "@/components/landing/LandingComo";
import LandingMapa from "@/components/landing/LandingMapa";
import LandingFAQ from "@/components/landing/LandingFAQ";
import LandingIntelligence from "@/components/landing/LandingIntelligence";

export default function LandingPageContent() {
  return (
    <main className="rc-landing">
      <LandingTriptychHero />
      <LandingMapa />
      <LandingComo />
      <LandingFAQ />
      <LandingIntelligence />
    </main>
  );
}
