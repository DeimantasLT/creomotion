import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import {
  HeroStory,
  TrustedBy,
  ServicesParallax,
  StatsBanner,
  Testimonials,
  ContactMinimal,
} from "@/components/sections";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F5F5F0]">
      {/* Navigation */}
      <Navigation />

      {/* Hero Section - Progressive Story Experience */}
      <HeroStory />

      {/* Trusted By / Client Logos */}
      <TrustedBy />

      {/* Stats/Expertise Banner - Repeating Text Parallax */}
      <StatsBanner />

      {/* Services Section - Numbered List with 3-Layer Parallax */}
      <ServicesParallax />

      {/* Testimonials Section - Cards with Avatars */}
      <Testimonials />

      {/* Contact Section - Minimal Design */}
      <ContactMinimal />

      {/* Footer */}
      <Footer />
    </main>
  );
}
