"use client";

import { useRef, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

const CREO_ROWS = 3;
const CREO_COLS = 3;
const MOTION_ROWS = 3;
const MOTION_COLS = 3;

interface TextCellProps {
  text: string;
  row: number;
  col: number;
  progress: any;
  baseSpeed: number;
  gridOffset: number;
}

function TextCell({ text, row, col, progress, baseSpeed, gridOffset }: TextCellProps) {
  const uniqueOffset = (row * 3 + col) * 0.1;
  
  const y = useTransform(
    progress,
    [0, 1],
    [0, baseSpeed * (50 + uniqueOffset * 20)]
  );
  
  const opacity = useTransform(
    progress,
    [0, 0.5, 1],
    [0.15, 0.25, 0.1]
  );

  const scale = useTransform(
    progress,
    [0, 0.5, 1],
    [1, 1.05, 0.95]
  );

  const springY = useSpring(y, { stiffness: 100, damping: 30 });
  const springScale = useSpring(scale, { stiffness: 150, damping: 20 });

  return (
    <motion.span
      className="inline-block font-display font-bold text-[15vw] md:text-[12vw] leading-[0.85] tracking-tighter select-none"
      style={{
        fontFamily: "'Space Grotesk', sans-serif",
        y: springY,
        opacity,
        scale: springScale,
      }}
      whileHover={{
        scale: 1.1,
        opacity: 0.6,
        transition: { duration: 0.2 },
      }}
    >
      {text}
    </motion.span>
  );
}

export function HeroText() {
  const containerRef = useRef<HTMLElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, 100]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[150vh] w-full bg-[#F5F5F0] overflow-hidden"
    >
      {/* CREO Grid - Top */}
      <div className="sticky top-0 h-screen flex flex-col justify-center items-center">
        <div className="relative w-full px-4 md:px-8">
          {/* CREO Text Grid */}
          <div className="flex flex-col items-center gap-0">
            {Array.from({ length: CREO_ROWS }).map((_, rowIndex) => (
              <div key={`creo-row-${rowIndex}`} className="flex justify-center gap-2 md:gap-4">
                {Array.from({ length: CREO_COLS }).map((_, colIndex) => (
                  <TextCell
                    key={`creo-${rowIndex}-${colIndex}`}
                    text="CREO"
                    row={rowIndex}
                    col={colIndex}
                    progress={scrollYProgress}
                    baseSpeed={rowIndex % 2 === 0 ? 1 : -0.5}
                    gridOffset={0}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* MOTION Text Grid - Overlapping */}
          <div className="flex flex-col items-center gap-0 -mt-[5vh] md:-mt-[8vh]">
            {Array.from({ length: MOTION_ROWS }).map((_, rowIndex) => (
              <div key={`motion-row-${rowIndex}`} className="flex justify-center gap-2 md:gap-4">
                {Array.from({ length: MOTION_COLS }).map((_, colIndex) => (
                  <TextCell
                    key={`motion-${rowIndex}-${colIndex}`}
                    text="MOTION"
                    row={rowIndex}
                    col={colIndex}
                    progress={scrollYProgress}
                    baseSpeed={rowIndex % 2 === 0 ? -0.8 : 1.2}
                    gridOffset={9}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Center Content Overlay */}
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center z-10"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {/* Badge */}
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <span 
                className="inline-flex items-center gap-2 px-4 py-2 border-2 border-black bg-[#F5F5F0] text-black text-xs md:text-sm tracking-wider"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                <span className="w-2 h-2 bg-[#FF2E63] animate-pulse" />
                AI-ENHANCED VIDEO PRODUCTION
              </span>
            </motion.div>

            {/* Main Title */}
            <motion.h1
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <span 
                className="block text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-black"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                CREO
                <span className="text-[#FF2E63]">MOTION</span>
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="mt-4 text-center text-sm md:text-base max-w-md px-4"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              Broadcast Motion Design & AI Video Production
            </motion.p>

            {/* CTA */}
            <motion.a
              href="#services"
              className="mt-8 border-2 border-black bg-black text-[#F5F5F0] px-6 py-3 text-sm font-bold tracking-wider hover:bg-[#FF2E63] hover:border-[#FF2E63] transition-colors duration-300"
              style={{ fontFamily: "'Space Grotesk', sans-serif", boxShadow: "4px 4px 0 0 #000" }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1 }}
              whileHover={{ x: 2, y: 2, boxShadow: "2px 2px 0 0 #000" }}
            >
              EXPLORE SERVICES →
            </motion.a>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <span 
            className="text-xs tracking-widest text-black/50"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            SCROLL
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-6 h-10 border-2 border-black/50 rounded-full flex justify-center pt-2"
          >
            <motion.div className="w-1 h-2 bg-black/50 rounded-full" />
          </motion.div>
        </motion.div>
      </div>

      {/* Gradient overlay for depth */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#F5F5F0] pointer-events-none z-20"
        style={{ y: backgroundY }}
      />
    </section>
  );
}

export default HeroText;
