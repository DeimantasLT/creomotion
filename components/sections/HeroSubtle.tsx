'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface Particle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  size: number;
  opacity: number;
  speed: number;
}

export function HeroSubtle() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>(0);
  const [isMobile, setIsMobile] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initialize particles
  useEffect(() => {
    if (isMobile || prefersReducedMotion) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    resizeCanvas();

    // Create particles
    const PARTICLE_COUNT = 25;
    particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      baseX: Math.random() * canvas.width,
      baseY: Math.random() * canvas.height,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.3 + 0.2,
      speed: Math.random() * 0.3 + 0.1,
    }));

    let frameCount = 0;
    const animate = () => {
      frameCount++;
      // Render every 2nd frame for performance (30fps)
      if (frameCount % 2 !== 0) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((particle) => {
        // Slow floating animation
        const time = Date.now() * particle.speed * 0.001;
        const floatOffset = Math.sin(time) * 15;

        // Mouse parallax (max 10px)
        const parallaxX = (mouseRef.current.x - 0.5) * 10 * particle.speed;
        const parallaxY = (mouseRef.current.y - 0.5) * 10 * particle.speed;

        // Calculate position
        const renderX = particle.baseX + floatOffset + parallaxX;
        const renderY = particle.baseY + Math.cos(time * 0.7) * 10 + parallaxY;

        // Draw particle
        ctx.beginPath();
        ctx.arc(renderX, renderY, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(150, 150, 140, ${particle.opacity})`;
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [isMobile, prefersReducedMotion]);

  // Mouse tracking
  useEffect(() => {
    if (isMobile || prefersReducedMotion) return;

    let timeout: NodeJS.Timeout;
    const handleMouseMove = (e: MouseEvent) => {
      clearTimeout(timeout);
      mouseRef.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      };
      timeout = setTimeout(() => {
        mouseRef.current = { x: 0.5, y: 0.5 };
      }, 100);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeout);
    };
  }, [isMobile, prefersReducedMotion]);

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen bg-[#F5F5F0] flex items-center justify-center overflow-hidden"
    >
      {/* Background "CREO" text */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      >
        <span 
          className="font-['Space_Grotesk'] text-[20vw] md:text-[18vw] font-bold text-[#E8E8DD] tracking-tighter"
          style={{ willChange: 'opacity' }}
        >
          CREO
        </span>
      </motion.div>

      {/* Particle canvas */}
      {!isMobile && !prefersReducedMotion && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 z-10 pointer-events-none"
          style={{ opacity: 1 }}
        />
      )}

      {/* Content container */}
      <div className="relative z-20 max-w-6xl mx-auto px-6 md:px-12 py-20">
        <div className="flex flex-col items-center text-center">
          {/* Main heading */}
          <motion.h1
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-black leading-tight tracking-tight mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          >
            Broadcast Quality
          </motion.h1>

          <motion.h2
            className="text-2xl md:text-4xl lg:text-5xl font-light text-black/90 tracking-wide mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
          >
            Creative Motion
          </motion.h2>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
          >
            <a
              href="#contact"
              className="group px-8 py-4 bg-black text-white font-medium rounded-full hover:bg-neutral-800 transition-colors duration-300 ease-out"
            >
              Start Project
            </a>
            <a
              href="#showreel"
              className="group px-8 py-4 border border-black/30 text-black font-medium rounded-full hover:border-black transition-colors duration-300 ease-out"
            >
              Watch Showreel
            </a>
          </motion.div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#F5F5F0] to-transparent z-20 pointer-events-none" />
    </div>
  );
}

export default HeroSubtle;
