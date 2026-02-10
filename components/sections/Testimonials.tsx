"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const TESTIMONIALS = [
  {
    id: 1,
    quote: "The combination of AI tools and creative expertise delivered our broadcast package in half the expected time without compromising quality.",
    author: "Justas K.",
    role: "Creative Director",
    company: "TV3 Lithuania",
    initials: "JK",
    color: "#FF2E63",
  },
  {
    id: 2,
    quote: "Finally, a motion designer who understands both broadcast standards and modern AI workflows. Exceptional work on our channel rebrand.",
    author: "Laura M.",
    role: "Head of Production",
    company: "LNK TV",
    initials: "LM",
    color: "#2E63FF",
  },
  {
    id: 3,
    quote: "CreoMotion transformed our brand guidelines into a living, breathing motion system that works across all our digital platforms.",
    author: "Tomas B.",
    role: "Marketing Manager",
    company: "PC Lietuva",
    initials: "TB",
    color: "#63FF2E",
  },
];

interface AvatarProps {
  initials: string;
  color: string;
  name: string;
}

function Avatar({ initials, color, name }: AvatarProps) {
  return (
    <div 
      className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center text-white font-bold text-lg md:text-xl shrink-0"
      style={{ 
        backgroundColor: color,
        fontFamily: "'Space Grotesk', sans-serif"
      }}
      aria-label={`Avatar for ${name}`}
    >
      {initials}
    </div>
  );
}

export function Testimonials() {
  return (
    <section className="w-full bg-[#F5F5F0] py-16 md:py-24" id="testimonials">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Section Header */}
        <div className="border-b-2 border-black pb-6 mb-12">
          <div className="flex items-end justify-between">
            <div>
              <p 
                className="text-xs tracking-[0.3em] mb-2 text-black/60"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                [CLIENT WORDS]
              </p>
              <h2 
                className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-black"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                TESTIMONIALS
              </h2>
            </div>
            <p 
              className="text-xs md:text-sm text-black/60 hidden md:block"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {TESTIMONIALS.length} / REVIEWS
            </p>
          </div>
        </div>

        {/* Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {TESTIMONIALS.map((testimonial, index) => (
            <motion.article
              key={testimonial.id}
              className="relative border-2 border-black bg-[#F5F5F0] p-6 md:p-8 flex flex-col"
              style={{ 
                boxShadow: "8px 8px 0 0 #000",
              }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              whileHover={{
                y: -8,
                x: -8,
                boxShadow: "16px 16px 0 0 #FF2E63",
              }}
            >
              {/* Number Badge - Top Right */}
              <div className="absolute top-4 right-4">
                <span 
                  className="text-xs font-bold text-black/20"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  0{testimonial.id}
                </span>
              </div>

              {/* Quote Icon */}
              <div className="mb-4">
                <Quote 
                  className="w-8 h-8 md:w-10 md:h-10 text-black/10" 
                  strokeWidth={1}
                />
              </div>

              {/* Quote Text */}
              <p 
                className="text-sm md:text-base leading-relaxed mb-6 flex-grow text-black/80"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                &ldquo;{testimonial.quote}&rdquo;
              </p>

              {/* Author Info with Avatar */}
              <div className="border-t-2 border-black pt-4 mt-auto">
                <div className="flex items-center gap-4">
                  <Avatar 
                    initials={testimonial.initials} 
                    color={testimonial.color}
                    name={testimonial.author}
                  />
                  <div>
                    <p 
                      className="font-bold text-black text-base md:text-lg"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      {testimonial.author}
                    </p>
                    <p 
                      className="text-xs text-black/60 mt-0.5"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      {testimonial.role}
                    </p>
                    <p 
                      className="text-xs text-black/40"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      {testimonial.company}
                    </p>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Testimonials;
