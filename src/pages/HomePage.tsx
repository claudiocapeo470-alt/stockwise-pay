import { useEffect } from "react";
import HeaderSection from "@/components/landing/HeaderSection";
import HeroSection from "@/components/landing/HeroSection";
import BusinessTypesSection from "@/components/landing/BusinessTypesSection";
import { StocksSection, POSSection, InvoicingSection, AnalyticsSection } from "@/components/landing/FeatureSections";
import { SyncSection, SecuritySection } from "@/components/landing/SyncSecuritySection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import CTASection from "@/components/landing/CTASection";
import FooterSection from "@/components/landing/FooterSection";

const HomePage = () => {
  // Force dark mode on landing page
  useEffect(() => {
    const root = document.documentElement;
    const previousTheme = root.classList.contains('dark') ? 'dark' : 'light';
    root.classList.remove('light');
    root.classList.add('dark');
    
    return () => {
      // Restore previous theme when leaving landing page
      const savedTheme = localStorage.getItem('theme') || previousTheme;
      root.classList.remove('dark', 'light');
      root.classList.add(savedTheme);
    };
  }, []);

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
        <HowItWorksSection />
        <CTASection />
      </main>
      <FooterSection />
    </div>
  );
};

export default HomePage;
