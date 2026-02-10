'use client';

import { motion } from 'framer-motion';
import { Play, ArrowDown, Sparkles } from 'lucide-react';
import { useRef } from 'react';

export function Hero() {
  const containerRef = useRef<HTMLElement>(null);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#F5F5F0]"
    >
      {/* Simple Background */}
      <div className="absolute inset-0 bg-[#F5F5F0]" />

      {/* Main Content */}
      <motion.div
        className="relative z-10 container mx-auto px-6 md:px-12 text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* AI Badge */}
        <div className="mb-8">
          <span className="inline-flex items-center gap-2 px-4 py-2 border-2 border-black bg-[#F5F5F0] text-black text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            <span>AI-Enhanced Video Production</span>
          </span>
        </div>

        {/* Main Headline */}
        <h1 className="font-display text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter mb-6">
          <span className="text-black">CREO</span>
          <span className="text-[#FF2E63]">MOTION</span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg md:text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
          Where <span className="text-[#FF2E63]">16+ years</span> of broadcast motion design
          meets <span className="text-[#08D9D6]">AI acceleration</span>.
          <br className="hidden md:block" />
          Premium video content delivered faster.
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mb-12">
          {[
            { value: '16+', label: 'Years' },
            { value: '200+', label: 'Projects' },
            { value: 'TV', label: 'Broadcast' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl md:text-4xl font-display font-bold text-black mb-1">
                {stat.value}
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a
            href="#projects"
            className="px-8 py-4 bg-black text-white font-semibold border-2 border-black flex items-center gap-2 hover:bg-[#FF2E63] transition-colors"
          >
            <Play className="w-5 h-5" />
            View Showreel
          </a>

          <a
            href="#contact"
            className="px-8 py-4 bg-white text-black font-semibold border-2 border-black flex items-center gap-2 hover:bg-gray-100 transition-colors"
          >
            <Sparkles className="w-5 h-5" />
            Start Your Project
          </a>
        </div>

        {/* Client Logos */}
        <div className="mt-16 pt-8 border-t-2 border-gray-200">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-6">
            Trusted by leading brands
          </p>
          <div className="flex justify-center items-center gap-8 md:gap-12">
            {['LRT', 'PC Lietuva', 'TV3', 'LNK', 'Delfi'].map((brand) => (
              <span key={brand} className="text-sm font-display font-bold text-gray-400">
                {brand}
              </span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-gray-400">
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs uppercase tracking-widest">Explore</span>
          <ArrowDown className="w-5 h-5" />
        </div>
      </div>
    </section>
  );
}
