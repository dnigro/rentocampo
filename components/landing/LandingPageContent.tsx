import LandingFigmaHome from "@/components/landing/LandingFigmaHome";
import LandingMapa from "@/components/landing/LandingMapa";
import LandingFAQ from "@/components/landing/LandingFAQ";
import LandingHowBrief from "@/components/landing/LandingHowBrief";

export default function LandingPageContent() {
  return (
    <main className="rc-landing">
      <LandingFigmaHome />
      <LandingMapa />
      <LandingHowBrief />
      <LandingFAQ />
    </main>
  );
}
