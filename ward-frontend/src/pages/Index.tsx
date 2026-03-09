import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ProblemSection from "@/components/ProblemSection";
import MechanismSection from "@/components/MechanismSection";
import IntegrationSection from "@/components/IntegrationSection";
import TrustSection from "@/components/TrustSection";
import CTASection from "@/components/CTASection";

const Index = () => {
  return (
    <main className="bg-background text-foreground" style={{ overflowX: "clip" }}>
      <Navbar />
      <HeroSection />
      <ProblemSection />
      <MechanismSection />
      <IntegrationSection />
      <TrustSection />
      <CTASection />
    </main>
  );
};

export default Index;
