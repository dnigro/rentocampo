import LandingTriptychHero from "@/components/landing/LandingTriptychHero";
import LandingMapa from "@/components/landing/LandingMapa";
import LandingFAQ from "@/components/landing/LandingFAQ";

export default function LandingPageContent() {
  return (
    <main className="rc-landing">
      <LandingTriptychHero />
      <LandingMapa />
      <LandingFAQ />
    </main>
  );
}
