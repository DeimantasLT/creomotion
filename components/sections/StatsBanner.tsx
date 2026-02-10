"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

const STATS_ROWS = [
  ["16+ YEARS", "200+ PROJECTS", "TV BROADCAST", "AI-ENHANCED", "16+ YEARS", "200+ PROJECTS", "TV BROADCAST"],
  ["PREMIUM QUALITY", "MOTION DESIGN", "BROADCAST TV", "CREATIVITY", "PREMIUM QUALITY", "MOTION DESIGN", "BROADCAST TV"],
  ["VILNIUS", "LITHUANIA", "GLOBAL", "CREOMOTION", "VILNIUS", "LITHUANIA", "GLOBAL"],
];

interface StatsRowProps {
  items: string[];
  direction: "left" | "right";
  speed: number;
  progress: any;
  rowIndex: number;
}

function StatsRow({ items, direction, speed, progress, rowIndex }: StatsRowProps) {
  // Each row moves at different scroll speeds
  const parallaxSpeed = [0.3, 0.5, 0.2][rowIndex];
  const yOffset = direction === "left" ? 50 * parallaxSpeed : -50 * parallaxSpeed;
  
  const y = useTransform(progress, [0, 1], [0, yOffset]);
  const opacity = useTransform(
    progress, 
    [0, 0.2, 0.8, 1], 
    [0.3, 1, 1, 0.3]
  );

  const springY = useSpring(y, { stiffness: 50, damping: 30 });

  return (
    <motion.div
      className="overflow-hidden py-3 md:py-4"
      style={{ opacity }}
    >
      <motion.div
        className="flex whitespace-nowrap"
        style={{ y: springY }}
      >
        <motion.div
          className="flex items-center"
          animate={{
            x: direction === "left" ? ["0%", "-50%"] : ["-50%", "0%"],
          }}
          transition={{
            duration: speed * 15,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {items.map((item, i) => (
            <span
              key={i}
              className="text-lg md:text-2xl lg:text-3xl font-bold tracking-tight mx-4 md:mx-8 text-black/80 hover:text-[#FF2E63] transition-colors duration-300 cursor-default"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {item}
              <span className="mx-4 md:mx-8 text-black/30">•</span>
            </span>
          ))}
        </motion.div>
        <motion.div
          className="flex items-center"
          animate={{
            x: direction === "left" ? ["0%", "-50%"] : ["-50%", "0%"],
          }}
          transition={{
            duration: speed * 15,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {items.map((item, i) => (
            <span
              key={`dup-${i}`}
              className="text-lg md:text-2xl lg:text-3xl font-bold tracking-tight mx-4 md:mx-8 text-black/80 hover:text-[#FF2E63] transition-colors duration-300 cursor-default"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {item}
              <span className="mx-4 md:mx-8 text-black/30">•</span>
            </span>
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export function StatsBanner() {
  const containerRef = useRef<HTMLElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  return (
    <section
      ref={containerRef}
      className="w-full bg-[#F5F5F0] py-12 md:py-20 border-y-2 border-black overflow-hidden"
    >
      <div className="space-y-2 md:space-y-4">
        {STATS_ROWS.map((row, index) => (
          <StatsRow
            key={index}
            items={row}
            direction={index % 2 === 0 ? "left" : "right"}
            speed={[1, 1.3, 0.8][index]}
            progress={scrollYProgress}
            rowIndex={index}
          />
        ))}
      </div>
    </section>
  );
}

export default StatsBanner;
