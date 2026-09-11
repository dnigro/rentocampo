import LandingHero from "@/components/landing/LandingHero";
import LandingComo from "@/components/landing/LandingComo";
import LandingMapa from "@/components/landing/LandingMapa";
import LandingFAQ from "@/components/landing/LandingFAQ";
import LandingCTA from "@/components/landing/LandingCTA";

export default function LandingPageContent() {
  return (
    <main className="rc-landing">
      <LandingHero />
      <LandingComo />
      <LandingMapa />
      <LandingFAQ />
      <LandingCTA />
    </main>
  );
}
