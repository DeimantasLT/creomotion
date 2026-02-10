"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import { motion, useReducedMotion, useInView } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// ============================================
// CONSTANTS & CONFIGURATION
// ============================================

const COLORS = {
  background: "#F5F5F0",
  text: "#000000",
  textMuted: "#6B7280",
  coral: "#FF2E63",
  cyan: "#08D9D6",
  border: "#000000",
};

const MOMENTS = {
  foundation: { start: 0, end: 100 },      // 0-100vh
  pivot: { start: 100, end: 200 },         // 100-200vh  
  fusion: { start: 200, end: 300 },        // 200-300vh
  invitation: { start: 300, end: 400 },    // 300-400vh
  entry: { start: 400, end: 500 },         // 400-500vh
};

// ============================================
// BROADCAST LOWER THIRD COMPONENT
// Animated SVG lower third that slides in
// ============================================
function BroadcastLowerThird({ 
  progress, 
  morphProgress 
}: { 
  progress: number; 
  morphProgress: number;
}) {
  // progress: 0-1 for entry animation
  // morphProgress: 0-1 for morphing to AI prompt interface
  
  const isMorphed = morphProgress > 0.5;
  
  return (
    <motion.div 
      className="absolute bottom-[15%] left-8 right-8 md:left-12 md:right-12 pointer-events-none"
      initial={{ opacity: 0, x: -100 }}
      animate={{ 
        opacity: progress > 0.2 ? 1 : 0,
        x: progress > 0.2 ? 0 : -100 
      }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <svg 
        viewBox="0 0 800 80" 
        className="w-full h-auto"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Background bar */}
        <motion.rect
          x="0"
          y="20"
          width={800}
          height="50"
          fill={isMorphed ? COLORS.coral : "#000"}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          style={{ originX: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        />
        
        {/* LIVE indicator */}
        <motion.g
          animate={{ opacity: isMorphed ? 0 : 1 }}
          transition={{ duration: 0.3 }}
        >
          <rect x="20" y="30" width="60" height="30" fill={COLORS.coral} />
          <text x="50" y="50" fill="#fff" fontSize="14" fontWeight="bold" textAnchor="middle" fontFamily="JetBrains Mono, monospace">
            LIVE
          </text>
          <motion.circle 
            cx="30" 
            cy="45" 
            r="4" 
            fill="#fff"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.g>
        
        {/* Text content */}
        <motion.text
          x={isMorphed ? "50%" : "100"}
          y="52"
          fill="#fff"
          fontSize={isMorphed ? "16" : "20"}
          fontWeight="bold"
          fontFamily="Space Grotesk, sans-serif"
          textAnchor={isMorphed ? "middle" : "start"}
          animate={{ 
            x: isMorphed ? 400 : 100,
            fontSize: isMorphed ? 16 : 20
          }}
          transition={{ duration: 0.5 }}
        >
          {isMorphed ? ">>> GENERATING VIDEO FROM PROMPT: 'Cinematic product reveal...'" : 
            "16 YEARS OF BROADCAST EXCELLENCE"}
        </motion.text>
        
        {/* AI Prompt cursor */}
        <motion.rect
          x="750"
          y="45"
          width="3"
          height="16"
          fill="#fff"
          animate={{ 
            opacity: isMorphed ? [1, 0, 1] : 0,
          }}
          transition={{ 
            duration: 0.8, 
            repeat: isMorphed ? Infinity : 0,
            ease: "steps(1)"
          }}
        />
      </svg>
    </motion.div>
  );
}

// ============================================
// PARTICLE FIELD COMPONENT
// Subtle creative energy particles
// ============================================
function ParticleField({ intensity }: { intensity: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const particlesRef = useRef<Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    life: number;
    maxLife: number;
  }>>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Initialize particles based on intensity
    const particleCount = Math.floor(intensity * 50);
    particlesRef.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 2 + 1,
      life: Math.random() * 100,
      maxLife: 100 + Math.random() * 100,
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
      
      particlesRef.current.forEach((p) => {
        // Update position
        p.x += p.vx;
        p.y += p.vy;
        p.life++;

        // Wrap around edges
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // Reset life
        if (p.life > p.maxLife) {
          p.life = 0;
          p.x = Math.random() * canvas.width;
          p.y = Math.random() * canvas.height;
        }

        // Draw particle
        const alpha = Math.sin((p.life / p.maxLife) * Math.PI) * intensity * 0.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 46, 99, ${alpha})`;
        ctx.fill();
      });

      // Draw connections
      if (intensity > 0.5) {
        particlesRef.current.forEach((p1, i) => {
          particlesRef.current.slice(i + 1).forEach((p2) => {
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < 100) {
              const alpha = (1 - dist / 100) * intensity * 0.15;
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.strokeStyle = `rgba(255, 46, 99, ${alpha})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          });
        });
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [intensity]);

  if (intensity <= 0) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ opacity: 0.6 }}
    />
  );
}

// ============================================
// SERVICE PILLAR BADGES
// TV STATIONS • AGENCIES • STARTUPS
// ============================================
function ServicePillars({ visible, hoverIndex, setHoverIndex }: { 
  visible: boolean; 
  hoverIndex: number | null;
  setHoverIndex: (i: number | null) => void;
}) {
  const pillars = [
    { label: "TV STATIONS", icon: "📡", desc: "Broadcast-ready content" },
    { label: "AGENCIES", icon: "⚡", desc: "Creative partnerships" },
    { label: "STARTUPS", icon: "🚀", desc: "Scalable solutions" },
  ];

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 mt-8">
      {pillars.map((pillar, index) => (
        <motion.div
          key={pillar.label}
          className="relative"
          initial={{ opacity: 0, y: 30 }}
          animate={{ 
            opacity: visible ? 1 : 0, 
            y: visible ? 0 : 30 
          }}
          transition={{ 
            duration: 0.5, 
            delay: index * 0.15,
            ease: [0.16, 1, 0.3, 1]
          }}
          onMouseEnter={() => setHoverIndex(index)}
          onMouseLeave={() => setHoverIndex(null)}
        >
          <motion.div
            className="flex items-center gap-3 px-6 py-3 border-2 border-black bg-[#F5F5F0] cursor-pointer"
            animate={{
              scale: hoverIndex === index ? 1.05 : 1,
              boxShadow: hoverIndex === index 
                ? `8px 8px 0px ${COLORS.coral}` 
                : "4px 4px 0px #000"
            }}
            transition={{ duration: 0.2 }}
          >
            <span className="text-2xl">{pillar.icon}</span>
            <span 
              className="font-bold tracking-wider text-sm md:text-base"
              style={{ fontFamily: "JetBrains Mono, monospace" }}
            >
              {pillar.label}
            </span>
          </motion.div>
          
          {/* Tooltip */}
          <motion.div
            className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap"
            initial={{ opacity: 0, y: -10 }}
            animate={{ 
              opacity: hoverIndex === index ? 1 : 0,
              y: hoverIndex === index ? 0 : -10
            }}
            transition={{ duration: 0.2 }}
          >
            <span className="text-xs font-mono tracking-wider text-black/60">
              {pillar.desc}
            </span>
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}

// ============================================
// CTA BUTTON WITH BRUTALIST SHADOW
// ============================================
function CTAButton({ visible }: { visible: boolean }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ 
        opacity: visible ? 1 : 0, 
        scale: visible ? 1 : 0.9 
      }}
      transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.a
        href="#work"
        className="inline-flex items-center gap-4 px-10 py-5 bg-black text-white font-bold text-lg md:text-xl tracking-wider border-2 border-black"
        style={{ fontFamily: "Space Grotesk, sans-serif" }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        animate={{
          x: isHovered ? -4 : 0,
          y: isHovered ? -4 : 0,
          boxShadow: isHovered 
            ? `12px 12px 0px ${COLORS.coral}` 
            : "8px 8px 0px #000"
        }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        whileTap={{ scale: 0.98 }}
      >
        EXPLORE THE WORKFLOW
        <motion.span
          animate={{ x: isHovered ? 5 : 0 }}
          transition={{ duration: 0.2 }}
        >
          →
        </motion.span>
      </motion.a>
    </motion.div>
  );
}

// ============================================
// SCROLL INDICATOR
// ============================================
function ScrollIndicator({ visible }: { visible: boolean }) {
  return (
    <motion.div
      className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.5, delay: 1 }}
    >
      <span 
        className="text-xs tracking-[0.3em] text-black/40 font-mono"
      >
        SCROLL TO SEE TRANSFORMATION
      </span>
      <motion.div
        className="w-6 h-10 border-2 border-black/30 rounded-full flex justify-center pt-2"
        animate={{ y: [0, 5, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.div 
          className="w-1.5 h-3 bg-black/40 rounded-full"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </motion.div>
  );
}

// ============================================
// SPLIT VISUALIZATION
// Traditional timeline vs AI prompt
// ============================================
function SplitVisualization({ progress }: { progress: number }) {
  // progress: 0-1 within the fusion moment
  
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
      {/* Left side - Traditional Timeline */}
      <motion.div 
        className="absolute left-[5%] w-[40%] h-[60%] border-2 border-black/20 bg-black/5"
        style={{ top: "20%" }}
        initial={{ opacity: 0, x: -50 }}
        animate={{ 
          opacity: progress > 0.1 ? 0.6 : 0,
          x: progress > 0.1 ? 0 : -50
        }}
        transition={{ duration: 0.6 }}
      >
        {/* Timeline tracks */}
        <div className="p-4 space-y-4">
          {["VIDEO", "AUDIO", "GRAPHICS", "TEXT"].map((track, i) => (
            <div key={track} className="flex items-center gap-2">
              <span className="text-xs font-mono text-black/40 w-16">{track}</span>
              <div className="flex-1 h-6 bg-black/10 relative">
                <motion.div 
                  className="absolute top-0 left-0 h-full bg-black/30"
                  initial={{ width: 0 }}
                  animate={{ width: `${20 + i * 15}%` }}
                  transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                />
              </div>
            </div>
          ))}
        </div>
        
        {/* Playhead */}
        <motion.div 
          className="absolute top-0 bottom-0 w-0.5 bg-red-500"
          initial={{ left: "0%" }}
          animate={{ left: "40%" }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
        >
          <div className="absolute -top-2 -left-1.5 w-4 h-4 bg-red-500 transform rotate-45" />
        </motion.div>
      </motion.div>

      {/* Right side - AI Prompt Interface */}
      <motion.div 
        className="absolute right-[5%] w-[40%] h-[60%] border-2 border-coral/30 bg-coral/5"
        style={{ 
          top: "20%",
          borderColor: `${COLORS.coral}40`,
          backgroundColor: `${COLORS.coral}10`
        }}
        initial={{ opacity: 0, x: 50 }}
        animate={{ 
          opacity: progress > 0.3 ? 0.8 : 0,
          x: progress > 0.3 ? 0 : 50
        }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="p-4 font-mono text-sm">
          <div 
            className="text-xs tracking-wider mb-4"
            style={{ color: COLORS.coral }}
          >
            AI PROMPT CHAIN
          </div>
          <div className="space-y-3">
            <motion.div 
              className="p-2 bg-white/50 border border-black/10"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: progress > 0.4 ? 1 : 0, y: progress > 0.4 ? 0 : 10 }}
              transition={{ delay: 0.3 }}
            >
              <span style={{ color: COLORS.coral }}>&gt;&gt;&gt;</span> Create cinematic intro...
            </motion.div>
            <motion.div 
              className="p-2 bg-white/50 border border-black/10"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: progress > 0.5 ? 1 : 0, y: progress > 0.5 ? 0 : 10 }}
              transition={{ delay: 0.4 }}
            >
              <span style={{ color: COLORS.coral }}>&gt;&gt;&gt;</span> Generate 3 variations...
            </motion.div>
            <motion.div 
              className="p-2 bg-white/50 border border-black/10"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: progress > 0.6 ? 1 : 0, y: progress > 0.6 ? 0 : 10 }}
              transition={{ delay: 0.5 }}
            >
              <span style={{ color: COLORS.coral }}>&gt;&gt;&gt;</span> Render final deliverable
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Fusion connector */}
      <motion.div
        className="absolute w-32 h-0.5 top-1/2 left-1/2 -translate-x-1/2"
        style={{ backgroundColor: COLORS.coral }}
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ 
          scaleX: progress > 0.7 ? 1 : 0,
          opacity: progress > 0.7 ? 1 : 0
        }}
        transition={{ duration: 0.4 }}
      />
    </div>
  );
}

// ============================================
// MAIN HERO STORY COMPONENT
// 5-Moment Scroll Experience
// ============================================
export function HeroStory() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [momentProgress, setMomentProgress] = useState({
    foundation: 0,
    pivot: 0,
    fusion: 0,
    invitation: 0,
    entry: 0,
  });
  const [pillarHover, setPillarHover] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const isInView = useInView(sectionRef, { once: true, amount: 0.1 });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // GSAP ScrollTrigger setup
  useEffect(() => {
    if (!containerRef.current || prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Create scroll tracker for each moment
      Object.entries(MOMENTS).forEach(([moment, range]) => {
        ScrollTrigger.create({
          trigger: containerRef.current,
          start: `${range.start}% top`,
          end: `${range.end}% top`,
          scrub: 0.5,
          onUpdate: (self) => {
            setMomentProgress((prev) => ({
              ...prev,
              [moment]: self.progress,
            }));
          },
        });
      });

      // Border breathing animation during fusion
      gsap.to(".hero-border", {
        scale: 1.02,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "200% top",
          end: "300% top",
          scrub: true,
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  // Calculate current moment based on progress
  const currentMoment = useMemo(() => {
    if (momentProgress.foundation < 1) return "foundation";
    if (momentProgress.pivot < 1) return "pivot";
    if (momentProgress.fusion < 1) return "fusion";
    if (momentProgress.invitation < 1) return "invitation";
    return "entry";
  }, [momentProgress]);

  // Mobile: simplify to essential moments
  const visibleMoments = isMobile 
    ? ["foundation", "fusion", "invitation"] 
    : ["foundation", "pivot", "fusion", "invitation", "entry"];

  const { foundation, pivot, fusion, invitation, entry } = momentProgress;

  // Helper to calculate visibility for each moment content
  const getMomentVisibility = (moment: string) => {
    switch (moment) {
      case "foundation":
        return foundation < 0.9 || entry > 0.5; // Stay visible until pivot takes over
      case "pivot":
        return pivot > 0.1 && pivot < 0.9;
      case "fusion":
        return fusion > 0.1 && fusion < 0.9;
      case "invitation":
        return invitation > 0.1 && invitation < 0.9;
      case "entry":
        return entry > 0.1;
      default:
        return false;
    }
  };

  return (
    <section 
      ref={sectionRef}
      className="relative bg-[#F5F5F0]"
      style={{ height: "500vh" }}
    >
      {/* Sticky Container */}
      <div 
        ref={containerRef}
        className="sticky top-0 h-screen overflow-hidden"
      >
        {/* Texture Overlay */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Grid Overlay */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(to right, #000 1px, transparent 1px),
              linear-gradient(to bottom, #000 1px, transparent 1px)
            `,
            backgroundSize: '100px 100px',
          }}
        />

        {/* ============================================
            MOMENT 1: THE FOUNDATION (0-100vh)
            ============================================ */}
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center px-6"
          initial={false}
          animate={{
            opacity: foundation > 0.2 && foundation < 0.9 ? 1 : Math.max(0, 1 - entry),
            scale: foundation > 0.1 ? 1 : 0.95,
            y: foundation > 0.8 ? -foundation * 100 : 0,
          }}
          transition={{ duration: 0.3 }}
        >
          {/* Main Headline */}
          <div className="relative">
            {/* Year badge */}
            <motion.div
              className="absolute -top-16 left-0 md:left-1/2 md:-translate-x-1/2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: foundation > 0.3 && foundation < 0.9 ? 1 : 0,
                y: foundation > 0.3 ? 0 : 20 
              }}
            >
              <span 
                className="px-4 py-2 border-2 border-black text-xs md:text-sm font-mono tracking-[0.2em] bg-[#F5F5F0]"
              >
                EST. 2009
              </span>
            </motion.div>

            {/* Main text */}
            <h1 
              className="text-[10vw] md:text-[12vw] font-bold uppercase tracking-tighter leading-[0.85] text-center"
              style={{ fontFamily: "Space Grotesk, sans-serif" }}
            >
              <motion.span
                className="block"
                initial={{ opacity: 0, y: 50 }}
                animate={{ 
                  opacity: foundation > 0.1 ? 1 : 0,
                  y: foundation > 0.1 ? 0 : 50 
                }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                16 Years
              </motion.span>
              <motion.span
                className="block"
                initial={{ opacity: 0, y: 50 }}
                animate={{ 
                  opacity: foundation > 0.2 ? 1 : 0,
                  y: foundation > 0.2 ? 0 : 50 
                }}
                transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              >
                of Broadcast
              </motion.span>
              <motion.span
                className="block"
                initial={{ opacity: 0, y: 50 }}
                animate={{ 
                  opacity: foundation > 0.3 ? 1 : 0,
                  y: foundation > 0.3 ? 0 : 50 
                }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                Motion Graphics
              </motion.span>
            </h1>

            {/* Subtext */}
            <motion.p
              className="mt-8 text-center text-sm md:text-base tracking-[0.15em] font-mono text-black/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: foundation > 0.5 ? 1 : 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              TV-READY • BRAND-SAFE • DEADLINE-DRIVEN
            </motion.p>
          </div>

          {/* Scroll Indicator */}
          <ScrollIndicator visible={foundation > 0.6 && foundation < 0.8} />
        </motion.div>

        {/* Broadcast Lower Third */}
        <BroadcastLowerThird 
          progress={foundation} 
          morphProgress={pivot} 
        />

        {/* ============================================
            MOMENT 2: THE PIVOT (100-200vh)
            ============================================ */}
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center px-6"
          initial={false}
          animate={{
            opacity: pivot > 0.1 && pivot < 0.9 ? 1 : 0,
          }}
          transition={{ duration: 0.3 }}
        >
          {/* Glitchy/Pivot Headline */}
          <div className="relative text-center">
            <motion.h2
              className="text-[8vw] md:text-[10vw] font-bold uppercase tracking-tighter leading-[0.9]"
              style={{ fontFamily: "Space Grotesk, sans-serif" }}
              animate={{
                x: pivot > 0.2 && pivot < 0.8 ? [0, -3, 3, -2, 2, 0] : 0,
              }}
              transition={{ 
                duration: 0.2,
                repeat: pivot > 0.2 && pivot < 0.8 ? 2 : 0,
                repeatDelay: 0.1
              }}
            >
              <motion.span
                className="block"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: pivot > 0.2 ? 1 : 0,
                  scale: pivot > 0.2 ? 1 : 0.8 
                }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                NOW POWERED
              </motion.span>
              <motion.span
                className="block"
                style={{ color: COLORS.coral }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: pivot > 0.4 ? 1 : 0,
                  scale: pivot > 0.4 ? 1 : 0.8 
                }}
                transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              >
                BY AI
              </motion.span>
            </motion.h2>

            {/* Neural network hint */}
            <motion.p
              className="mt-8 text-center text-sm md:text-base tracking-[0.1em] font-mono"
              initial={{ opacity: 0 }}
              animate={{ opacity: pivot > 0.5 ? 1 : 0 }}
              transition={{ duration: 0.5 }}
            >
              Traditional craft meets{" "}
              <span style={{ color: COLORS.coral }}>intelligent workflows</span>
            </motion.p>
          </div>

          {/* Subtle neural pattern background */}
          <svg 
            className="absolute inset-0 pointer-events-none opacity-5"
            style={{ opacity: pivot * 0.1 }}
          >
            <defs>
              <pattern id="neural" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                <circle cx="50" cy="50" r="2" fill="#FF2E63" />
                <line x1="50" y1="50" x2="20" y2="20" stroke="#FF2E63" strokeWidth="0.5" />
                <line x1="50" y1="50" x2="80" y2="20" stroke="#FF2E63" strokeWidth="0.5" />
                <line x1="50" y1="50" x2="20" y2="80" stroke="#FF2E63" strokeWidth="0.5" />
                <line x1="50" y1="50" x2="80" y2="80" stroke="#FF2E63" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#neural)" />
          </svg>
        </motion.div>

        {/* ============================================
            MOMENT 3: THE FUSION (200-300vh)
            ============================================ */}
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center px-6 md:px-12"
          initial={false}
          animate={{
            opacity: fusion > 0.05 && fusion < 0.95 ? 1 : 0,
          }}
          transition={{ duration: 0.3 }}
        >
          {/* Split Visualization Background */}
          {!isMobile && <SplitVisualization progress={fusion} />}

          {/* Main Headline */}
          <div className="relative z-10 text-center">
            <motion.h2
              className="text-[7vw] md:text-[9vw] font-bold uppercase tracking-tighter leading-[0.9]"
              style={{ fontFamily: "Space Grotesk, sans-serif" }}
            >
              <motion.span
                className="block"
                initial={{ opacity: 0, y: 30 }}
                animate={{ 
                  opacity: fusion > 0.1 ? 1 : 0,
                  y: fusion > 0.1 ? 0 : 30 
                }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                Where Precision
              </motion.span>
              <motion.span
                className="relative inline-block"
                initial={{ opacity: 0, y: 30 }}
                animate={{ 
                  opacity: fusion > 0.2 ? 1 : 0,
                  y: fusion > 0.2 ? 0 : 30 
                }}
                transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              >
                <span style={{ color: COLORS.coral }}>Meets Intelligence</span>
                {/* Underline animation */}
                <motion.span
                  className="absolute -bottom-2 left-0 right-0 h-1"
                  style={{ backgroundColor: COLORS.coral }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: fusion > 0.4 ? 1 : 0 }}
                  transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                />
              </motion.span>
            </motion.h2>

            {/* Subtext */}
            <motion.p
              className="mt-8 text-center text-sm md:text-base tracking-[0.1em] font-mono text-black/60 max-w-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: fusion > 0.5 ? 1 : 0 }}
              transition={{ duration: 0.5 }}
            >
              Faster iterations. Smarter variations. Same broadcast quality.
            </motion.p>
          </div>

          {/* Particle Field */}
          <ParticleField intensity={fusion > 0.3 ? Math.min((fusion - 0.3) * 2, 1) * (isMobile ? 0.3 : 1) : 0} />
        </motion.div>

        {/* ============================================
            MOMENT 4: THE INVITATION (300-400vh)
            ============================================ */}
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center px-6"
          initial={false}
          animate={{
            opacity: invitation > 0.05 && invitation < 0.95 ? 1 : 0,
          }}
          transition={{ duration: 0.3 }}
        >
          {/* Welcome Headline */}
          <motion.div
            className="text-center mb-8"
            initial={{ scale: 0.9 }}
            animate={{ scale: invitation > 0.2 ? 1 : 0.9 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.p
              className="text-sm md:text-base font-mono tracking-[0.2em] text-black/60 mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: invitation > 0.1 ? 1 : 0 }}
              transition={{ duration: 0.4 }}
            >
              THE STUDIO
            </motion.p>
            <h2
              className="text-[10vw] md:text-[8vw] font-bold uppercase tracking-tighter leading-none"
              style={{ fontFamily: "Space Grotesk, sans-serif" }}
            >
              <motion.span
                className="block"
                initial={{ opacity: 0, y: 40 }}
                animate={{ 
                  opacity: invitation > 0.15 ? 1 : 0,
                  y: invitation > 0.15 ? 0 : 40 
                }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                Welcome to
              </motion.span>
              <motion.span
                className="block"
                style={{ color: COLORS.coral }}
                initial={{ opacity: 0, y: 40 }}
                animate={{ 
                  opacity: invitation > 0.3 ? 1 : 0,
                  y: invitation > 0.3 ? 0 : 40 
                }}
                transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              >
                Creomotion
              </motion.span>
            </h2>
          </motion.div>

          {/* Service Pillars */}
          <ServicePillars 
            visible={invitation > 0.4} 
            hoverIndex={pillarHover}
            setHoverIndex={setPillarHover}
          />

          {/* CTA Button */}
          <div className="mt-12">
            <CTAButton visible={invitation > 0.6} />
          </div>

          {/* Stats row */}
          <motion.div
            className="flex gap-8 md:gap-16 mt-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: invitation > 0.7 ? 1 : 0, y: invitation > 0.7 ? 0 : 20 }}
            transition={{ duration: 0.5 }}
          >
            {[
              { value: "16+", label: "YEARS" },
              { value: "200+", label: "PROJECTS" },
              { value: "TV", label: "BROADCAST" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div 
                  className="text-2xl md:text-3xl font-bold"
                  style={{ fontFamily: "Space Grotesk, sans-serif" }}
                >
                  {stat.value}
                </div>
                <div className="text-xs tracking-[0.2em] text-black/60 font-mono">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* ============================================
            MOMENT 5: THE ENTRY (400-500vh)
            ============================================ */}
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center px-6"
          initial={false}
          animate={{
            opacity: entry > 0.1 ? 1 : 0,
            y: entry > 0.3 ? -entry * 50 : 0,
          }}
          transition={{ duration: 0.5 }}
        >
          {/* Horizontal entry line */}
          <motion.div
            className="absolute left-0 right-0 h-px bg-black/20"
            style={{ top: "60%" }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: entry > 0.2 ? 1 : 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          />

          {/* Exit/Transition text */}
          <motion.p
            className="text-center text-lg md:text-2xl font-mono tracking-wider text-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: entry > 0.4 ? 1 : 0 }}
            transition={{ duration: 0.5 }}
          >
            Let&apos;s create something that moves people.
          </motion.p>

          {/* Continue indicator */}
          <motion.div
            className="absolute bottom-12 flex flex-col items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: entry > 0.6 ? 1 : 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <span className="text-xs tracking-[0.2em] font-mono text-black/40">
              CONTINUE TO PORTFOLIO
            </span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              ↓
            </motion.div>
          </motion.div>
        </motion.div>

        {/* ============================================
            PERSISTENT FRAME BORDERS
            Brutalist container that "breathes"
            ============================================ */}
        <div 
          className="hero-border absolute inset-4 md:inset-8 lg:inset-12 pointer-events-none"
          style={{
            border: `2px solid ${COLORS.border}`,
          }}
        >
          {/* Corner accents */}
          <div className="absolute -top-2 -left-2 w-6 h-6 border-t-2 border-l-2 border-black" />
          <div className="absolute -top-2 -right-2 w-6 h-6 border-t-2 border-r-2 border-black" />
          <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-2 border-l-2 border-black" />
          <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-2 border-r-2 border-black" />
        </div>

        {/* Progress indicator */}
        <div className="absolute top-8 right-8 flex gap-2 z-20">
          {["foundation", "pivot", "fusion", "invitation", "entry"].map((moment, index) => {
            const isActive = currentMoment === moment;
            const isPast = momentProgress[moment as keyof typeof momentProgress] >= 0.9;
            const isCurrent = momentProgress[moment as keyof typeof momentProgress] > 0.1 && 
                              momentProgress[moment as keyof typeof momentProgress] < 0.9;
            
            if (isMobile && (moment === "pivot" || moment === "entry")) return null;
            
            return (
              <motion.div
                key={moment}
                className="h-1 rounded-full"
                style={{ backgroundColor: isCurrent || isPast ? COLORS.coral : "rgba(0,0,0,0.1)" }}
                animate={{ 
                  width: isActive ? 32 : 8,
                }}
                transition={{ duration: 0.3 }}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default HeroStory;
