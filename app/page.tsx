// Use named exports from backup components
import HeroFinal from "@/components/sections/HeroFinal";
import ServicesParallax from "@/components/sections/ServicesParallax";
import { ProjectGallery } from "@/components/sections/ProjectGallery";
import { Testimonials } from "@/components/sections/Testimonials";
import { TrustedBy } from "@/components/sections/TrustedBy";
import { ContactMinimal } from "@/components/sections/ContactMinimal";

export default function Home() {
  return (
    <main className="relative bg-[#0a0a0a]">
      <HeroFinal />
      <TrustedBy />
      <ServicesParallax />
      <ProjectGallery />
      <Testimonials />
      <ContactMinimal />
    </main>
  );
}
