"use client";

import { motion } from "framer-motion";

const CLIENTS = [
  { name: "LRT", fullName: "Lithuanian National Radio & Television" },
  { name: "TV3", fullName: "TV3 Lithuania" },
  { name: "LNK", fullName: "LNK TV" },
  { name: "Delfi", fullName: "Delfi.lt" },
  { name: "PC Lietuva", fullName: "PC Lietuva" },
];

export function TrustedBy() {
  return (
    <section className="w-full bg-[#F5F5F0] py-12 md:py-16 border-y-2 border-black" id="clients">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Section Header */}
        <motion.p 
          className="text-xs tracking-[0.3em] mb-8 md:mb-12 text-black/60 text-center"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          [TRUSTED BY LEADING BRANDS]
        </motion.p>
        
        {/* Logos Grid - Evenly distributed */}
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 lg:gap-20">
          {CLIENTS.map((client, index) => (
            <motion.div
              key={client.name}
              className="group cursor-default"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -4 }}
            >
              <div className="relative">
                {/* Logo text - Bigger */}
                <span 
                  className="text-3xl md:text-5xl lg:text-6xl font-bold text-black/25 group-hover:text-black transition-colors duration-300 tracking-tight block text-center"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {client.name}
                </span>
                
                {/* Full name - Shows on hover */}
                <span 
                  className="block text-xs text-black/0 group-hover:text-black/50 transition-colors duration-300 mt-2 text-center"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {client.fullName}
                </span>
                
                {/* Hover underline accent */}
                <motion.div
                  className="absolute -bottom-1 left-0 right-0 h-1 bg-[#FF2E63] origin-left"
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TrustedBy;
