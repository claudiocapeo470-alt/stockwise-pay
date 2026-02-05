import { useEffect } from "react";
import HeaderSection from "@/components/landing/HeaderSection";
import HeroSection from "@/components/landing/HeroSection";
import BusinessTypesSection from "@/components/landing/BusinessTypesSection";
import { StocksSection, POSSection, InvoicingSection, AnalyticsSection } from "@/components/landing/FeatureSections";
import { SyncSection, SecuritySection } from "@/components/landing/SyncSecuritySection";
import CTASection from "@/components/landing/CTASection";
import FooterSection from "@/components/landing/FooterSection";
import { GlowCursor, PortalSection, VelocityScroll } from "@/components/landing/ImmersiveAnimations";

const HomePage = () => {
  // Smooth scroll behavior
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Glow cursor effect */}
      <GlowCursor />
      
      <HeaderSection />
      
      <main>
        {/* Hero with parallax */}
        <HeroSection />
        
        {/* Portal sections avec transitions cinématiques */}
        <VelocityScroll>
          <PortalSection id="business-types">
            <BusinessTypesSection />
          </PortalSection>
        </VelocityScroll>
        
        <VelocityScroll>
          <PortalSection id="stocks">
            <StocksSection />
          </PortalSection>
        </VelocityScroll>
        
        <VelocityScroll>
          <PortalSection id="pos">
            <POSSection />
          </PortalSection>
        </VelocityScroll>
        
        <VelocityScroll>
          <PortalSection id="invoicing">
            <InvoicingSection />
          </PortalSection>
        </VelocityScroll>
        
        <VelocityScroll>
          <PortalSection id="analytics">
            <AnalyticsSection />
          </PortalSection>
        </VelocityScroll>
        
        <VelocityScroll>
          <PortalSection id="sync">
            <SyncSection />
          </PortalSection>
        </VelocityScroll>
        
        <VelocityScroll>
          <PortalSection id="security">
            <SecuritySection />
          </PortalSection>
        </VelocityScroll>
        
        <VelocityScroll>
          <PortalSection id="cta">
            <CTASection />
          </PortalSection>
        </VelocityScroll>
      </main>
      
      <FooterSection />
    </div>
  );
};

export default HomePage;
