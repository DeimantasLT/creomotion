'use client';

import { useEffect, useRef, useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Play, ArrowDown, Sparkles } from 'lucide-react';

// Particle configuration
const PARTICLE_COUNT = 25;
const MAX_PARALLAX = 10; // Max 10px mouse parallax
const CONNECTION_DISTANCE = 120; // Max distance for connection lines
const MAX_CONNECTIONS = 4; // Max connections per particle

interface Particle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  size: number;
  opacity: number;
  speedX: number;
  speedY: number;
  phase: number;
}

export function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>(0);
  const isVisibleRef = useRef(true);
  const prefersReducedMotion = useReducedMotion();

  // Initialize particles
  const initParticles = useCallback((width: number, height: number) => {
    particlesRef.current = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
      // Create a slight bias toward center for larger particles
      const isCenter = i < PARTICLE_COUNT * 0.4;
      const x = Math.random() * width;
      const y = Math.random() * height;
      
      return {
        x,
        y,
        baseX: x,
        baseY: y,
        size: isCenter ? Math.random() * 2 + 2 : Math.random() * 1.5 + 1, // 1-3.5px
        opacity: isCenter ? Math.random() * 0.05 + 0.1 : Math.random() * 0.04 + 0.08, // 8-15%
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
        phase: Math.random() * Math.PI * 2,
      };
    });
  }, []);

  // Draw particles and connections
  const draw = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.clearRect(0, 0, width, height);

    const time = Date.now() * 0.0005;
    const mouseOffsetX = (mouseRef.current.x - 0.5) * MAX_PARALLAX;
    const mouseOffsetY = (mouseRef.current.y - 0.5) * MAX_PARALLAX;

    // Update and draw particles
    particlesRef.current.forEach((particle) => {
      // Organic drift using sine waves
      const driftX = Math.sin(time + particle.phase) * 15;
      const driftY = Math.cos(time * 0.7 + particle.phase) * 12;

      // Calculate final position with parallax
      particle.x = particle.baseX + driftX + mouseOffsetX * (0.5 + particle.size * 0.1);
      particle.y = particle.baseY + driftY + mouseOffsetY * (0.5 + particle.size * 0.1);

      // Wrap around edges smoothly
      if (particle.x < -20) particle.baseX += width + 40;
      if (particle.x > width + 20) particle.baseX -= width + 40;
      if (particle.y < -20) particle.baseY += height + 40;
      if (particle.y > height + 20) particle.baseY -= height + 40;
    });

    // Draw connection lines first (behind particles)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)'; // Very subtle connections
    ctx.lineWidth = 0.5;

    for (let i = 0; i < particlesRef.current.length; i++) {
      const p1 = particlesRef.current[i];
      let connections = 0;

      for (let j = i + 1; j < particlesRef.current.length && connections < MAX_CONNECTIONS; j++) {
        const p2 = particlesRef.current[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < CONNECTION_DISTANCE) {
          const opacity = (1 - distance / CONNECTION_DISTANCE) * 0.06;
          ctx.strokeStyle = `rgba(200, 200, 190, ${opacity})`;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
          connections++;
        }
      }
    }

    // Draw particles with soft glow
    particlesRef.current.forEach((particle) => {
      // Soft glow effect
      const gradient = ctx.createRadialGradient(
        particle.x, particle.y, 0,
        particle.x, particle.y, particle.size * 3
      );
      gradient.addColorStop(0, `rgba(255, 255, 255, ${particle.opacity})`);
      gradient.addColorStop(0.4, `rgba(255, 255, 255, ${particle.opacity * 0.5})`);
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Core dot
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity * 1.5})`;
      ctx.fill();
    });
  }, []);

  // Animation loop
  useEffect(() => {
    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.scale(dpr, dpr);
      initParticles(rect.width, rect.height);
    };

    resizeCanvas();

    // Intersection Observer for performance
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
      },
      { threshold: 0.1 }
    );
    observer.observe(container);

    // Animation loop with frame skipping for mobile
    let lastTime = 0;
    const targetFPS = 60;
    const frameInterval = 1000 / targetFPS;

    const animate = (currentTime: number) => {
      animationRef.current = requestAnimationFrame(animate);

      // Skip frames if not visible
      if (!isVisibleRef.current) return;

      // Limit to 60fps
      const delta = currentTime - lastTime;
      if (delta < frameInterval) return;
      lastTime = currentTime - (delta % frameInterval);

      const rect = container.getBoundingClientRect();
      draw(ctx, rect.width, rect.height);
    };

    animationRef.current = requestAnimationFrame(animate);

    // Handle resize
    window.addEventListener('resize', resizeCanvas, { passive: true });

    return () => {
      cancelAnimationFrame(animationRef.current);
      observer.disconnect();
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [prefersReducedMotion, initParticles, draw]);

  // Mouse tracking
  useEffect(() => {
    if (prefersReducedMotion) return;

    let rafId: number;
    let targetX = 0.5;
    let targetY = 0.5;
    let currentX = 0.5;
    let currentY = 0.5;

    const handleMouseMove = (e: MouseEvent) => {
      targetX = e.clientX / window.innerWidth;
      targetY = e.clientY / window.innerHeight;
    };

    // Smooth interpolation
    const updateMouse = () => {
      currentX += (targetX - currentX) * 0.1;
      currentY += (targetY - currentY) * 0.1;
      mouseRef.current = { x: currentX, y: currentY };
      rafId = requestAnimationFrame(updateMouse);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    rafId = requestAnimationFrame(updateMouse);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, [prefersReducedMotion]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#F5F5F0]"
    >
      {/* Subtle gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#F5F5F0] via-[#F5F5F0] to-[#EAEAE0] pointer-events-none" />

      {/* Particle canvas layer */}
      {!prefersReducedMotion && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 z-10 pointer-events-none"
          style={{ mixBlendMode: 'overlay' }}
        />
      )}

      {/* Main Content */}
      <motion.div
        className="relative z-20 container mx-auto px-6 md:px-12 text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {/* AI Badge */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 border-2 border-black bg-[#F5F5F0] text-black text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            <span>AI-Enhanced Video Production</span>
          </span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1 
          className="font-display text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <span className="text-black">CREO</span>
          <span className="text-[#FF2E63]">MOTION</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p 
          className="text-lg md:text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          Where <span className="text-[#FF2E63] font-medium">16+ years</span> of broadcast motion design
          meets <span className="text-[#08D9D6] font-medium">AI acceleration</span>.
          <br className="hidden md:block" />
          Premium video content delivered faster.
        </motion.p>

        {/* Stats Grid */}
        <motion.div 
          className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          {[
            { value: '16+', label: 'Years' },
            { value: '200+', label: 'Projects' },
            { value: 'TV', label: 'Broadcast' },
          ].map((stat, index) => (
            <motion.div 
              key={stat.label} 
              className="text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
            >
              <div className="text-3xl md:text-4xl font-display font-bold text-black mb-1">
                {stat.value}
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <a
            href="#projects"
            className="px-8 py-4 bg-black text-white font-semibold border-2 border-black flex items-center gap-2 hover:bg-[#FF2E63] hover:border-[#FF2E63] transition-all duration-300"
          >
            <Play className="w-5 h-5" />
            View Showreel
          </a>

          <a
            href="#contact"
            className="px-8 py-4 bg-white text-black font-semibold border-2 border-black flex items-center gap-2 hover:bg-gray-100 transition-all duration-300"
          >
            <Sparkles className="w-5 h-5" />
            Start Your Project
          </a>
        </motion.div>

        {/* Client Logos */}
        <motion.div 
          className="mt-16 pt-8 border-t-2 border-gray-200"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.9 }}
        >
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-6">
            Trusted by leading brands
          </p>
          <div className="flex justify-center items-center gap-8 md:gap-12">
            {['LRT', 'PC Lietuva', 'TV3', 'LNK', 'Delfi'].map((brand, index) => (
              <motion.span 
                key={brand} 
                className="text-sm font-display font-bold text-gray-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 1 + index * 0.1 }}
              >
                {brand}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 text-gray-400"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.2 }}
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs uppercase tracking-widest">Explore</span>
          <motion.div
            animate={{ y: [0, 4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowDown className="w-5 h-5" />
          </motion.div>
        </div>
      </motion.div>

      {/* Bottom gradient fade for smooth transition to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#F5F5F0] to-transparent z-[5] pointer-events-none" />
    </section>
  );
}

export default HeroCanvas;
