// HeroFinal - Server Component (Next.js 15)
import Link from 'next/link';
import { prisma } from '@/lib/prisma';

// Server-side data fetching
async function getHeroContent() {
  try {
    const section = await prisma.contentSection.findUnique({
      where: { key: 'hero' }
    });
    
    if (section?.data) {
      const data = section.data as { headline?: string; subheadline?: string; ctaText?: string; ctaUrl?: string; ctaLink?: string };
      return {
        headline: data.headline || "Creative Motion Studio",
        subheadline: data.subheadline || "We craft compelling visual stories...",
        ctaText: data.ctaText || "View Our Work",
        ctaUrl: data.ctaUrl || data.ctaLink || "/work"
      };
    }
  } catch {
    // Fallback if DB not ready
  }
  
  return {
    headline: "Creative Motion Studio",
    subheadline: "We craft compelling visual stories that captivate audiences and elevate brands through innovative video production and motion design.",
    ctaText: "View Our Work",
    ctaUrl: "/work"
  };
}

export default async function HeroFinal() {
  const hero = await getHeroContent();

  return (
    <section className="relative min-h-screen flex items-center bg-[#0a0a0a] overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#ff006e]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#8338ec]/5 rounded-full blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-50 px-6 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="font-mono text-sm tracking-widest text-white/80 hover:text-white transition-colors">
            CREOMOTION
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-mono text-white/60">
            <Link href="/work" className="hover:text-white transition-colors">WORK</Link>
            <Link href="/services" className="hover:text-white transition-colors">SERVICES</Link>
            <Link href="/about" className="hover:text-white transition-colors">ABOUT</Link>
            <Link href="/contact" className="hover:text-white transition-colors">CONTACT</Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20">
        <div className="animate-fade-in-up">
          {/* Label */}
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px w-12 bg-[#ff006e]" />
            <span className="font-mono text-xs tracking-widest text-[#ff006e]">
              MOTION DESIGN STUDIO
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight">
            {hero.headline}
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-white/60 max-w-2xl mb-12 leading-relaxed">
            {hero.subheadline}
          </p>

          {/* CTA Button */}
          <Link
            href={hero.ctaUrl || "/work"}
            className="inline-flex items-center gap-3 px-8 py-4 bg-[#ff006e] text-white font-mono text-sm tracking-wider hover:bg-[#ff006e]/90 transition-all"
          >
            {hero.ctaText}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/20 rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-white/40 rounded-full" />
        </div>
      </div>
    </section>
  );
}
