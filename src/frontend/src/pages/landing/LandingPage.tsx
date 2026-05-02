import { Navbar } from '../../components/landing/Navbar';
import { Hero } from '../../components/landing/Hero';
import { AboutSection } from '../../components/landing/AboutSection';
import { StatsSection } from '../../components/landing/StatsSection';
import { CatalogPreview } from '../../components/landing/CatalogPreview';
import { CTASection } from '../../components/landing/CTASection';
import { Footer } from '../../components/landing/Footer';

export function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: '#f8fafc', color: '#0f172a' }}>
      <Navbar />
      <main>
        <Hero />
        <AboutSection />
        <StatsSection />
        <CatalogPreview />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
