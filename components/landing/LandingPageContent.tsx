import LandingTriptychHero from "@/components/landing/LandingTriptychHero";
import LandingMapa from "@/components/landing/LandingMapa";
import LandingFAQ from "@/components/landing/LandingFAQ";
import LandingHowBrief from "@/components/landing/LandingHowBrief";

export default function LandingPageContent() {
  return (
    <main className="rc-landing">
      <LandingTriptychHero />
      <LandingMapa />
      <LandingHowBrief />
      <LandingFAQ />
    </main>
  );
}
