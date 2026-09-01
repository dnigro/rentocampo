import LandingHero from "@/components/landing/LandingHero";
import LandingActividad from "@/components/landing/LandingActividad";
import LandingComo from "@/components/landing/LandingComo";
import LandingMapa from "@/components/landing/LandingMapa";
import LandingFAQ from "@/components/landing/LandingFAQ";
import LandingCTA from "@/components/landing/LandingCTA";

export default function LandingPageContent() {
  return (
    <main>
      <LandingHero />
      <LandingActividad />
      <LandingComo />
      <LandingMapa />
      <LandingFAQ />
      <LandingCTA />
    </main>
  );
}
