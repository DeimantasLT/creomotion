"use client";

import { useContentSection } from "@/hooks/useContentSection";
import { Film, Palette, Clock, Zap, type LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Film,
  Palette,
  Clock,
  Zap,
};

// Fallback data
const defaultServices = [
  {
    icon: "Film",
    title: "AI Video Production",
    description:
      "End-to-end video production accelerated with AI. From concept to final delivery 3x faster.",
  },
  {
    icon: "Palette",
    title: "Motion Graphics",
    description:
      "Broadcast-quality motion design for TV, web, and social media. 16+ years of experience.",
  },
  {
    icon: "Clock",
    title: "Time Tracking",
    description:
      "Transparent project management with integrated time tracking and real-time progress updates.",
  },
  {
    icon: "Zap",
    title: "Rapid Delivery",
    description:
      "Tight deadline? No problem. AI-assisted workflows deliver premium results in record time.",
  },
];

interface ServiceItem {
  icon: string;
  title: string;
  description: string;
}

interface ServicesContent {
  title: string;
  subtitle: string;
  items: ServiceItem[];
}

function SkeletonCard() {
  return (
    <div className="p-8 border border-white/10 bg-[#141414] animate-pulse min-h-[280px]">
      <div className="w-16 h-8 bg-white/10 rounded mb-4" />
      <div className="w-8 h-8 bg-white/10 rounded mb-4" />
      <div className="w-3/4 h-6 bg-white/10 rounded mb-3" />
      <div className="w-full h-20 bg-white/10 rounded" />
    </div>
  );
}

export default function Services() {
  const { data: content, loading, error } = useContentSection("services");

  // Use CMS data or fallback to defaults
  const cmsContent = content as ServicesContent | undefined;
  const services = cmsContent?.items?.length
    ? cmsContent.items
    : defaultServices;
  const title = cmsContent?.title || "SERVICES";
  const subtitle =
    cmsContent?.subtitle ||
    "Premium motion design services powered by AI and years of broadcast experience";

  if (error) {
    console.error("Failed to load services content:", error);
  }

  return (
    <section id="services" className="py-24 bg-[#0a0a0a]">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-display font-bold text-white mb-6">
            {title}
          </h2>
          <p className="text-lg text-white/60">{subtitle}</p>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {[...Array(4)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {services.map((service, index) => {
              const IconComponent = iconMap[service.icon] || Zap;
              return (
                <div
                  key={service.title}
                  className="p-8 border border-white/10 bg-[#141414] hover:border-[#ff006e]/50 transition-colors min-h-[280px]"
                >
                  <div className="text-5xl font-display font-bold text-[#ff006e] mb-4">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <IconComponent className="w-8 h-8 mb-4 text-white/60" />
                  <h3 className="text-xl font-semibold mb-3 text-white">
                    {service.title}
                  </h3>
                  <p className="text-white/60">{service.description}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
