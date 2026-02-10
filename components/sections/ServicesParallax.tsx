"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

interface Service {
  id: number;
  number: string;
  title: string;
  description: string;
}

const services: Service[] = [
  {
    id: 1,
    number: "01",
    title: "AI VIDEO PRODUCTION",
    description: "AI-enhanced workflows delivering broadcast-quality content 3x faster than traditional methods.",
  },
  {
    id: 2,
    number: "02",
    title: "MOTION GRAPHICS",
    description: "Dynamic visual systems and animated content for broadcast, brands, and digital platforms.",
  },
  {
    id: 3,
    number: "03",
    title: "BROADCAST DESIGN",
    description: "Complete channel identity systems including opens, transitions, lower thirds, and graphics packages.",
  },
  {
    id: 4,
    number: "04",
    title: "BRAND ANIMATION",
    description: "Logo animations, brand stories, and motion guidelines that bring your visual identity to life.",
  },
  {
    id: 5,
    number: "05",
    title: "3D & VFX",
    description: "Photorealistic 3D renders and visual effects that elevate your production value.",
  },
  {
    id: 6,
    number: "06",
    title: "CREATIVE DIRECTION",
    description: "Strategic creative oversight from concept to final delivery, ensuring cohesive visual storytelling.",
  },
];

interface ServiceItemProps {
  service: Service;
  index: number;
  progress: any;
}

function ServiceItem({ service, index, progress }: ServiceItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Three layers at different scroll speeds for parallax depth
  const layer1Y = useTransform(progress, [0, 1], [0, (index % 2 === 0 ? 30 : -20)]);
  const layer2Y = useTransform(progress, [0, 1], [0, (index % 2 === 0 ? -50 : 40)]);
  const layer3Y = useTransform(progress, [0, 1], [0, (index % 2 === 0 ? 20 : -30)]);
  
  const spring1 = useSpring(layer1Y, { stiffness: 100, damping: 30 });
  const spring2 = useSpring(layer2Y, { stiffness: 80, damping: 25 });
  const spring3 = useSpring(layer3Y, { stiffness: 120, damping: 35 });

  return (
    <motion.div
      className="relative border-b-2 border-black py-8 md:py-12 px-4 md:px-8 overflow-hidden group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ backgroundColor: "#000" }}
      transition={{ duration: 0.3 }}
    >
      {/* Layer 3 - Farthest back ( ghost number ) */}
      <motion.div
        className="absolute top-1/2 right-8 md:right-16 -translate-y-1/2 pointer-events-none"
        style={{ y: spring3 }}
      >
        <span 
          className="text-[20vw] md:text-[15vw] font-bold text-black/[0.03] group-hover:text-[#F5F5F0]/[0.05] transition-colors duration-300 select-none"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          {service.number}
        </span>
      </motion.div>

      {/* Layer 2 - Middle ( duplicate title ) */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{ y: spring2 }}
      >
        <span 
          className="text-2xl md:text-4xl font-bold text-black/[0.08] group-hover:text-[#FF2E63]/20 transition-colors duration-300 tracking-tight whitespace-nowrap select-none"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {service.title}
        </span>
      </motion.div>

      {/* Layer 1 - Front ( main content ) */}
      <motion.div
        className="relative z-10 flex flex-col md:flex-row md:items-center gap-4 md:gap-8"
        style={{ y: spring1 }}
      >
        {/* Number */}
        <span 
          className="text-4xl md:text-6xl font-bold text-black/30 group-hover:text-[#FF2E63] transition-colors duration-300 w-20 md:w-24 shrink-0"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          {service.number}
        </span>

        {/* Content */}
        <div className="flex-1">
          <h3 
            className="text-2xl md:text-4xl lg:text-5xl font-bold tracking-tight text-black group-hover:text-[#F5F5F0] transition-colors duration-300"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {service.title}
          </h3>
          
          {/* Description - reveals on hover */}
          <motion.p
            className="mt-2 md:mt-4 text-sm md:text-base text-black/70 group-hover:text-[#F5F5F0]/80 max-w-xl transition-colors duration-300"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
            initial={{ opacity: 0, height: 0 }}
            animate={{ 
              opacity: isHovered ? 1 : 0,
              height: isHovered ? "auto" : 0,
            }}
            transition={{ duration: 0.3 }}
          >
            {service.description}
          </motion.p>
        </div>

        {/* Arrow */}
        <motion.div
          className="w-12 h-12 md:w-16 md:h-16 border-2 border-black group-hover:border-[#F5F5F0] flex items-center justify-center shrink-0 transition-colors duration-300"
          animate={{ rotate: isHovered ? 45 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-black group-hover:text-[#F5F5F0] transition-colors duration-300"
          >
            <path d="M7 17L17 7M17 7H7M17 7V17" />
          </svg>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export function ServicesParallax() {
  const containerRef = useRef<HTMLElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  return (
    <section
      ref={containerRef}
      className="w-full bg-[#F5F5F0] py-16 md:py-24"
      id="services"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Section Header */}
        <div className="border-b-2 border-black pb-6 mb-8">
          <div className="flex items-end justify-between">
            <div>
              <p 
                className="text-xs tracking-[0.3em] mb-2 text-black/60"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                [OUR EXPERTISE]
              </p>
              <h2 
                className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-black"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                SERVICES
              </h2>
            </div>
            <p 
              className="text-xs md:text-sm text-black/60 hidden md:block"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              06 / SERVICES
            </p>
          </div>
        </div>

        {/* Services List */}
        <div className="border-t-2 border-black">
          {services.map((service, index) => (
            <ServiceItem
              key={service.id}
              service={service}
              index={index}
              progress={scrollYProgress}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default ServicesParallax;
