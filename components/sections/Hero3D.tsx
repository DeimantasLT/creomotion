"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// ============================================
// BRUTALIST ARCHITECTURE HERO3D
// Light Through Concrete & Glass
// ============================================

// Warm concrete colors
const CONCRETE_COLORS = ["#C4C4BC", "#B8B8B0", "#ACACA4", "#A0A098", "#94948C", "#8A8A80"];

// Glass transmission values
const GLASS_ROUGHNESS = 0.15;
const GLASS_TRANSMISSION = 0.6;
const GLASS_THICKNESS = 0.5;

// Light orb colors
const ORB_COLORS = {
  warm: ["#FFF8E7", "#FFF5D6", "#FFEFC8"],
  coral: ["#FF2E63"],
};

// ============================================
// CONCRETE SLAT COMPONENT
// Vertical brutalist column with rough texture
// ============================================
interface ConcreteSlatProps {
  position: [number, number, number];
  height: number;
  width: number;
  depth: number;
  colorIndex: number;
}

function ConcreteSlat({ position, height, width, depth, colorIndex }: ConcreteSlatProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const color = CONCRETE_COLORS[colorIndex % CONCRETE_COLORS.length];

  return (
    <mesh ref={meshRef} position={position} castShadow receiveShadow>
      <boxGeometry args={[width, height, depth]} />
      <meshStandardMaterial
        color={color}
        roughness={0.9}
        metalness={0.02}
        flatShading={false}
      />
    </mesh>
  );
}

// ============================================
// GLASS PANEL COMPONENT
// Frosted/translucent glass between slats
// ============================================
interface GlassPanelProps {
  position: [number, number, number];
  width: number;
  height: number;
}

function GlassPanel({ position, width, height }: GlassPanelProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[width, height, 0.02]} />
      <meshPhysicalMaterial
        color="#E8E8E0"
        metalness={0}
        roughness={GLASS_ROUGHNESS}
        transmission={GLASS_TRANSMISSION}
        thickness={GLASS_THICKNESS}
        envMapIntensity={0.5}
        clearcoat={0.1}
        clearcoatRoughness={0.1}
        transparent
        opacity={0.3}
      />
    </mesh>
  );
}

// ============================================
// GLOWING ORB COMPONENT
// Soft light source passing behind slats
// ============================================
interface GlowingOrbProps {
  initialPosition: [number, number, number];
  color: string;
  size: number;
  speedX: number;
  speedY: number;
  speedZ: number;
  rangeX: number;
  rangeY: number;
  delay?: number;
}

function GlowingOrb({
  initialPosition,
  color,
  size,
  speedX,
  speedY,
  speedZ,
  rangeX,
  rangeY,
  delay = 0,
}: GlowingOrbProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const startTime = useRef(delay);

  useFrame((state) => {
    if (!meshRef.current || !lightRef.current) return;
    
    const time = state.clock.getElapsedTime() + startTime.current;
    
    // Slow horizontal drift
    const x = initialPosition[0] + Math.sin(time * speedX) * rangeX;
    const y = initialPosition[1] + Math.cos(time * speedY * 0.7) * rangeY;
    const z = initialPosition[2] + Math.sin(time * speedZ * 0.3) * 2;
    
    meshRef.current.position.set(x, y, z);
    lightRef.current.position.set(x, y, z);
    
    // Subtle size pulse
    const scale = 1 + Math.sin(time * 0.5) * 0.1;
    meshRef.current.scale.setScalar(scale);
  });

  return (
    <group>
      {/* The glowing orb mesh */}
      <mesh ref={meshRef} position={initialPosition}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {/* Actual point light for illumination */}
      <pointLight
        ref={lightRef}
        position={initialPosition}
        color={color}
        intensity={2}
        distance={15}
        decay={2}
      />
      
      {/* Inner core for extra glow */}
      <mesh position={initialPosition} scale={0.5}>
        <sphereGeometry args={[size, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={1}
        />
      </mesh>
    </group>
  );
}

// ============================================
// ARCHITECTURAL SCENE
// Brutalist grid of slats with glass and lights
// ============================================
function ArchitecturalScene() {
  const groupRef = useRef<THREE.Group>(null);

  // Generate slat grid configuration
  const slatConfig = useMemo(() => {
    const configs: Array<{
      key: string;
      x: number;
      z: number;
      height: number;
      isSlat: boolean;
    }> = [];
    
    const rows = 5;
    const cols = 7;
    const spacingX = 1.8;
    const spacingZ = 2.5;
    const baseHeight = 8;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = (col - cols / 2) * spacingX;
        const z = -8 + row * spacingZ;
        
        // Every other column is a glass panel, others are concrete
        const isSlat = col % 2 === 0;
        
        if (isSlat) {
          // Concrete slat with random height variation
          const heightVariation = Math.random() * 4 - 2;
          const height = baseHeight + heightVariation;
          configs.push({
            key: `slat-${row}-${col}`,
            x,
            z,
            height,
            isSlat: true,
          });
        } else {
          // Glass panel position (between slats)
          configs.push({
            key: `glass-${row}-${col}`,
            x,
            z,
            height: baseHeight - 1,
            isSlat: false,
          });
        }
      }
    }
    return configs;
  }, []);

  // Light orbs configuration
  const orbsConfig = useMemo(() => {
    return [
      // Warm white orbs
      { color: ORB_COLORS.warm[0], x: -4, y: 1, z: -6, size: 0.6, speedX: 0.15, speedY: 0.12, rangeX: 3, rangeY: 2, delay: 0 },
      { color: ORB_COLORS.warm[1], x: 2, y: -1, z: -4, size: 0.5, speedX: 0.1, speedY: 0.08, rangeX: 4, rangeY: 3, delay: 2 },
      { color: ORB_COLORS.warm[2], x: -2, y: 2, z: -2, size: 0.7, speedX: 0.08, speedY: 0.15, rangeX: 2.5, rangeY: 2.5, delay: 4 },
      { color: ORB_COLORS.warm[0], x: 4, y: 0, z: -8, size: 0.55, speedX: 0.12, speedY: 0.1, rangeX: 3.5, rangeY: 2, delay: 1 },
      // Coral accent orbs (lower opacity)
      { color: ORB_COLORS.coral[0], x: 0, y: 2.5, z: -5, size: 0.4, speedX: 0.18, speedY: 0.14, rangeX: 2, rangeY: 1.5, delay: 3 },
      { color: ORB_COLORS.coral[0], x: -3, y: -1.5, z: -3, size: 0.35, speedX: 0.2, speedY: 0.09, rangeX: 2.5, rangeY: 2, delay: 5 },
    ];
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();
    
    // Very slow overall rotation for meditative feel
    groupRef.current.rotation.y = Math.sin(time * 0.03) * 0.05;
  });

  return (
    <group ref={groupRef}>
      {/* Ambient environment */}
      <ambientLight intensity={0.4} color="#F5F5F0" />
      
      {/* Directional light for shadows */}
      <directionalLight
        position={[10, 10, 5]}
        intensity={0.6}
        color="#FFF8E7"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.1}
        shadow-camera-far={50}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
      />
      
      {/* Fill light */}
      <directionalLight
        position={[-8, 5, -5]}
        intensity={0.3}
        color="#FFFFFF"
      />

      {/* Architectural grid */}
      {slatConfig.map((config) => {
        if (config.isSlat) {
          return (
            <ConcreteSlat
              key={config.key}
              position={[config.x, 0, config.z]}
              height={config.height}
              width={0.8}
              depth={0.6}
              colorIndex={Math.floor(Math.random() * CONCRETE_COLORS.length)}
            />
          );
        } else {
          return (
            <GlassPanel
              key={config.key}
              position={[config.x, 0, config.z]}
              width={spacingX - 0.8}
              height={config.height}
            />
          );
        }
      })}

      {/* Animated light orbs (behind the architecture) */}
      {orbsConfig.map((orb, index) => (
        <GlowingOrb
          key={`orb-${index}`}
          initialPosition={[orb.x, orb.y, orb.z]}
          color={orb.color}
          size={orb.size}
          speedX={orb.speedX}
          speedY={orb.speedY}
          speedZ={0.05}
          rangeX={orb.rangeX}
          rangeY={orb.rangeY}
          delay={orb.delay}
        />
      ))}
    </group>
  );
}

// ============================================
// CAMERA CONTROLLER
// Mouse interaction and slow drift
// ============================================
function CameraController() {
  const { camera } = useThree();
  const mouseRef = useRef({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse position (-1 to 1)
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    // Slow camera drift
    const driftX = Math.sin(time * 0.05) * 0.5;
    const driftY = Math.cos(time * 0.03) * 0.3;
    
    // Mouse influence (max 5 degrees as requested)
    const mouseInfluenceX = mouseRef.current.x * 0.15; // About 5 degrees
    const mouseInfluenceY = mouseRef.current.y * 0.1;
    
    camera.position.x = driftX + mouseInfluenceX;
    camera.position.y = driftY + mouseInfluenceY;
    camera.lookAt(0, 0, -4);
  });

  return null;
}

// Spacing constant for glass panels
const spacingX = 1.8;

// ============================================
// MARQUEE BANNER
// ============================================
function HeroMarqueeRow() {
  const text = "PREMIUM VIDEO • AI-ENHANCED • BROADCAST QUALITY • ";
  
  return (
    <div className="overflow-hidden py-3 border-y border-black/20 bg-[#F5F5F0]/80">
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
        {Array.from({ length: 6 }).map((_, i) => (
          <span
            key={i}
            className="text-sm md:text-base font-medium tracking-[0.2em] mx-4 text-black/60"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {text}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// ============================================
// MAIN HERO3D COMPONENT
// ============================================
export function Hero3D() {
  const [isMobile, setIsMobile] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      setIsMobile(window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <section className="relative min-h-screen w-full bg-[#F5F5F0] overflow-hidden">
      {/* 3D Canvas Background - Brutalist Architecture */}
      {mounted && !prefersReducedMotion && (
        <div className="absolute inset-0 z-0">
          <Canvas
            camera={{ position: [0, 0, 12], fov: 45 }}
            dpr={[1, 1.5]}
            gl={{ 
              antialias: true, 
              alpha: true,
              powerPreference: "high-performance",
            }}
            shadows
          >
            <CameraController />
            {!isMobile && <ArchitecturalScene />}
          </Canvas>
        </div>
      )}

      {/* Fallback gradient for mobile/reduced motion */}
      {(isMobile || prefersReducedMotion) && (
        <div 
          className="absolute inset-0 z-0 opacity-60"
          style={{
            background: `
              radial-gradient(ellipse at 30% 40%, rgba(196,196,188,0.5) 0%, transparent 50%),
              radial-gradient(ellipse at 70% 60%, rgba(138,138,128,0.4) 0%, transparent 50%),
              radial-gradient(ellipse at 50% 50%, rgba(200,200,192,0.3) 0%, transparent 60%)
            `
          }}
        />
      )}

      {/* Grid overlay for brutalist feel */}
      <div 
        className="absolute inset-0 z-[1] pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #000 1px, transparent 1px),
            linear-gradient(to bottom, #000 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Top content area */}
        <div className="flex-1 flex flex-col justify-center items-center px-6 md:px-12 py-20">
          {/* Badge */}
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
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
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <span 
              className="block text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter text-black"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              CREO
              <span className="text-[#FF2E63]">MOTION</span>
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="mt-6 text-center text-base md:text-lg max-w-md px-4"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            Broadcast Motion Design & AI Video Production
          </motion.p>

          {/* Stats Row */}
          <motion.div
            className="mt-12 flex flex-wrap justify-center gap-8 md:gap-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            {[
              { value: "16+", label: "YEARS" },
              { value: "200+", label: "PROJECTS" },
              { value: "TV", label: "BROADCAST" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div 
                  className="text-3xl md:text-4xl font-bold text-black"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {stat.value}
                </div>
                <div 
                  className="text-xs tracking-[0.2em] text-black/60 mt-1"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            className="mt-12 flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
          >
            <motion.a
              href="#contact"
              className="px-8 py-4 bg-black text-white font-bold tracking-wider border-2 border-black"
              style={{ 
                fontFamily: "'Space Grotesk', sans-serif",
                boxShadow: "8px 8px 0 0 #000"
              }}
              whileHover={{ 
                x: 4, 
                y: 4, 
                boxShadow: "4px 4px 0 0 #FF2E63",
                borderColor: "#FF2E63"
              }}
              transition={{ duration: 0.2 }}
            >
              START PROJECT →
            </motion.a>
            <motion.a
              href="#showreel"
              className="px-8 py-4 bg-transparent text-black font-bold tracking-wider border-2 border-black hover:bg-black hover:text-white transition-colors duration-300"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              WATCH SHOWREEL
            </motion.a>
          </motion.div>
        </div>

        {/* Marquee Banner at bottom */}
        <motion.div
          className="w-full bg-[#F5F5F0]/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          <HeroMarqueeRow />
        </motion.div>
      </div>

      {/* Gradient overlay at bottom for smooth transition */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#F5F5F0] to-transparent z-20 pointer-events-none" />
    </section>
  );
}

export default Hero3D;
