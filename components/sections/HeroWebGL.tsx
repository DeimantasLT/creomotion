'use client';

import { useRef, useEffect, useState } from 'react';
import { Sparkles, Play } from 'lucide-react';

export default function HeroWebGL() {
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) * 0.02;
        const y = (e.clientY - rect.top - rect.height / 2) * 0.02;
        setMousePos({ x, y });
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section 
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#F5F5F0]"
    >
      {/* Animated Particles */}
      <div 
        ref={particlesRef}
        className="absolute inset-0 pointer-events-none"
        style={{
          transform: `translate(${mousePos.x}px, ${mousePos.y}px)`,
          transition: 'transform 0.3s ease-out',
        }}
      >
        {Array.from({ length: 50 }).map((_, i) => (
          <span
            key={i}
            className="absolute rounded-full opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 6 + 2}px`,
              height: `${Math.random() * 6 + 2}px`,
              backgroundColor: i < 15 ? '#FF2E63' : '#C4C4B9',
              animation: `float ${Math.random() * 4 + 3}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Background Text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
        <span 
          className="text-[15vw] md:text-[12vw] font-display font-bold text-[#E8E8DD] tracking-tighter leading-none"
        >
          CREO
        </span>
        <span 
          className="text-[12vw] md:text-[10vw] font-display font-bold text-[#F0F0E8] tracking-tighter leading-none -mt-4"
        >
          MOTION
        </span>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 text-center">
        {/* Badge */}
        <div className="mb-8">
          <span className="inline-flex items-center gap-2 px-4 py-2 border-2 border-black bg-[#F5F5F0] text-black text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            AI-Enhanced Video Production
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-black mb-6 leading-tight">
          Broadcast Quality<br />
          <span className="text-[#FF2E63]">Creative Motion</span>
        </h1>

        {/* Description */}
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10">
          From TV commercials to AI-enhanced video production. 
          16+ years crafting motion that moves audiences.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a
            href="#contact"
            className="px-8 py-4 bg-[#FF2E63] text-white font-semibold border-2 border-[#FF2E63] flex items-center gap-2 hover:bg-[#E61E51] hover:border-[#E61E51] transition-colors"
          >
            Start Project
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>

          <button
            className="px-8 py-4 bg-transparent text-black font-semibold border-2 border-black flex items-center gap-2 hover:bg-black hover:text-white transition-colors"
          >
            <Play className="w-5 h-5" />
            Watch Showreel
          </button>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-400">
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-[#FF2E63] to-transparent" />
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </section>
  );
}
