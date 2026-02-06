import HeaderSection from "@/components/landing/HeaderSection";
import HeroSection from "@/components/landing/HeroSection";
import BusinessTypesSection from "@/components/landing/BusinessTypesSection";
import { StocksSection, POSSection, InvoicingSection, AnalyticsSection } from "@/components/landing/FeatureSections";
import { SyncSection, SecuritySection } from "@/components/landing/SyncSecuritySection";
import CTASection from "@/components/landing/CTASection";
import FooterSection from "@/components/landing/FooterSection";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <HeaderSection />
      <main>
        <HeroSection />
        <BusinessTypesSection />
        <StocksSection />
        <POSSection />
        <InvoicingSection />
        <AnalyticsSection />
        <SyncSection />
        <SecuritySection />
        <CTASection />
      </main>
      <FooterSection />
    </div>
  );
};

export default HomePage;
