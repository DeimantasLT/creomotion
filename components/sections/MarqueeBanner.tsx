"use client";

import { motion } from "framer-motion";

// Simple, subtle marquee for use in hero section
interface MarqueeBannerProps {
  variant?: "hero" | "section";
}

export function MarqueeBanner({ variant = "section" }: MarqueeBannerProps) {
  const text = "PREMIUM VIDEO • AI-ENHANCED • BROADCAST QUALITY • ";
  
  if (variant === "hero") {
    return (
      <div className="w-full bg-[#F5F5F0]/80 backdrop-blur-sm border-y border-black/20">
        <div className="overflow-hidden py-3">
          <motion.div
            className="flex whitespace-nowrap"
            animate={{
              x: ["0%", "-50%"],
            }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <span
                key={i}
                className="text-sm md:text-base font-medium tracking-[0.2em] mx-4 text-black/50"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {text}
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <section className="w-full bg-[#F5F5F0] py-4">
      <div className="overflow-hidden py-3 border-y border-black/20">
        <motion.div
          className="flex whitespace-nowrap"
          animate={{
            x: ["0%", "-50%"],
          }}
          transition={{
            duration: 35,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <span
              key={i}
              className="text-base md:text-lg font-medium tracking-[0.15em] mx-6 text-black/40"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {text}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default MarqueeBanner;
