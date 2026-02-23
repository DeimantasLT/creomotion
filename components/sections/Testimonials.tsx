"use client";

import { useContentSection } from "@/hooks/useContentSection";
import { motion } from "framer-motion";
import { Quote } from "lucide-react";

// Fallback data
const defaultTestimonials = [
  {
    id: 1,
    quote:
      "The combination of AI tools and creative expertise delivered our broadcast package in half the expected time without compromising quality.",
    author: "Justas K.",
    role: "Creative Director",
    company: "TV3 Lithuania",
    tier: "GOLD",
  },
  {
    id: 2,
    quote:
      "Finally, a motion designer who understands both broadcast standards and modern AI workflows. Exceptional work on our channel rebrand.",
    author: "Laura M.",
    role: "Head of Production",
    company: "LNK TV",
    tier: "SILVER",
  },
  {
    id: 3,
    quote:
      "CreoMotion transformed our brand guidelines into a living, breathing motion system that works across all our digital platforms.",
    author: "Tomas B.",
    role: "Marketing Manager",
    company: "PC Lietuva",
    tier: "BRONZE",
  },
];

interface TestimonialItem {
  id: number;
  quote: string;
  author: string;
  role: string;
  company: string;
  tier?: "GOLD" | "SILVER" | "BRONZE";
}

interface TestimonialsContent {
  title: string;
  subtitle: string;
  items: TestimonialItem[];
}

const tierColors: Record<string, string> = {
  GOLD: "#ff006e",
  SILVER: "#60a5fa",
  BRONZE: "#f59e0b",
  DEFAULT: "#ff006e",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface AvatarProps {
  name: string;
  tier?: string;
}

function Avatar({ name, tier }: AvatarProps) {
  const color = tierColors[tier || "DEFAULT"];
  const initials = getInitials(name);
  return (
    <div
      className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center text-white font-bold text-lg md:text-xl shrink-0"
      style={{
        backgroundColor: color,
        fontFamily: "'Space Grotesk', sans-serif",
      }}
      aria-label={`Avatar for ${name}`}
    >
      {initials}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="relative border border-white/10 bg-[#141414] p-6 md:p-8 flex flex-col min-h-[320px] animate-pulse">
      <div className="absolute top-4 right-4 w-6 h-4 bg-white/10 rounded" />
      <div className="mb-4 w-10 h-10 bg-white/10 rounded" />
      <div className="flex-grow space-y-2">
        <div className="w-full h-4 bg-white/10 rounded" />
        <div className="w-full h-4 bg-white/10 rounded" />
        <div className="w-3/4 h-4 bg-white/10 rounded" />
        <div className="w-full h-4 bg-white/10 rounded" />
      </div>
      <div className="border-t border-white/10 pt-4 mt-auto">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-white/10" />
          <div className="space-y-2">
            <div className="w-24 h-5 bg-white/10 rounded" />
            <div className="w-32 h-3 bg-white/10 rounded" />
            <div className="w-20 h-3 bg-white/10 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function Testimonials() {
  const { data: content, loading, error } =
    useContentSection("testimonials");

  // Use CMS data or fallback to defaults
  const cmsContent = content as TestimonialsContent | undefined;
  const testimonials = cmsContent?.items?.length
    ? cmsContent.items
    : defaultTestimonials;
  const title = cmsContent?.title || "CLIENTS";
  const subtitle =
    cmsContent?.subtitle || "Trusted by industry leaders";

  if (error) {
    console.error("Failed to load testimonials content:", error);
  }

  return (
    <section className="w-full bg-[#0a0a0a] py-16 md:py-24" id="testimonials">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Section Header */}
        <div className="border-b border-white/10 pb-6 mb-12">
          <div className="flex items-end justify-between">
            <div>
              <p
                className="text-xs tracking-[0.3em] mb-2 text-white/40"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                [CLIENT WORDS]
              </p>
              <h2
                className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-white"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {title}
              </h2>
            </div>
            <p
              className="text-xs md:text-sm text-white/40 hidden md:block"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {testimonials.length} / REVIEWS
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[...Array(3)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.article
                key={testimonial.id}
                className="relative border border-white/10 bg-[#141414] p-6 md:p-8 flex flex-col min-h-[320px] hover:border-[#ff006e]/30 transition-colors"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
              >
                {/* Number Badge - Top Right */}
                <div className="absolute top-4 right-4">
                  <span
                    className="text-xs font-bold text-white/20"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    0{testimonial.id}
                  </span>
                </div>

                {/* Quote Icon */}
                <div className="mb-4">
                  <Quote
                    className="w-8 h-8 md:w-10 md:h-10 text-white/10"
                    strokeWidth={1}
                  />
                </div>

                {/* Quote Text */}
                <p
                  className="text-sm md:text-base leading-relaxed mb-6 flex-grow text-white/80"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  &ldquo;{testimonial.quote}&rdquo;
                </p>

                {/* Author Info with Avatar */}
                <div className="border-t border-white/10 pt-4 mt-auto">
                  <div className="flex items-center gap-4 min-h-[44px]">
                    <Avatar
                      name={testimonial.author}
                      tier={testimonial.tier}
                    />
                    <div>
                      <p
                        className="font-bold text-white text-base md:text-lg"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                      >
                        {testimonial.author}
                      </p>
                      <p
                        className="text-xs text-white/60 mt-0.5"
                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        {testimonial.role}
                      </p>
                      <p
                        className="text-xs text-white/40"
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
        )}
      </div>
    </section>
  );
}

export default Testimonials;
