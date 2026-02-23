"use client";

import { useContentSection } from "@/hooks/useContentSection";
import { Mail, Phone, MapPin, type LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Mail,
  Phone,
  MapPin,
};

// Fallback data
const defaultContactInfo = [
  {
    icon: "Mail",
    label: "Email",
    value: "hello@creomotion.lt",
    link: "mailto:hello@creomotion.lt",
  },
  {
    icon: "Phone",
    label: "Phone",
    value: "+370 600 00000",
    link: "tel:+37060000000",
  },
  {
    icon: "MapPin",
    label: "Location",
    value: "Vilnius, Lithuania",
    link: "#",
  },
];

interface ContactItem {
  icon: string;
  label: string;
  value: string;
  link: string;
}

interface ContactContent {
  title: string;
  subtitle: string;
  items: ContactItem[];
  formEnabled: boolean;
}

function SkeletonContactCard() {
  return (
    <div className="p-8 border border-white/10 bg-[#141414] text-center animate-pulse min-h-[160px]">
      <div className="w-8 h-8 mx-auto mb-4 bg-white/10 rounded" />
      <div className="w-16 h-3 mx-auto mb-2 bg-white/10 rounded" />
      <div className="w-32 h-5 mx-auto bg-white/10 rounded" />
    </div>
  );
}

function SkeletonForm() {
  return (
    <div className="max-w-2xl mx-auto mt-16 p-8 border border-white/10 bg-[#141414] animate-pulse">
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i}>
            <div className="w-12 h-3 mb-2 bg-white/10 rounded" />
            <div className="w-full h-14 bg-white/10 rounded" />
          </div>
        ))}
        <div className="w-full h-14 bg-[#ff006e]/50 rounded" />
      </div>
    </div>
  );
}

export default function Contact() {
  const { data: content, loading, error } = useContentSection("contact");

  // Use CMS data or fallback to defaults
  const cmsContent = content as ContactContent | undefined;
  const contactInfo = cmsContent?.items?.length
    ? cmsContent.items
    : defaultContactInfo;
  const title = cmsContent?.title || "LET'S CREATE";
  const subtitle =
    cmsContent?.subtitle ||
    "Have a project in mind? Let's discuss how AI-powered motion design can elevate your brand.";
  const formEnabled =
    cmsContent?.formEnabled !== undefined ? cmsContent.formEnabled : true;

  if (error) {
    console.error("Failed to load contact content:", error);
  }

  return (
    <section id="contact" className="py-24 bg-[#0a0a0a]">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-display font-bold text-white mb-6">
            {title}
          </h2>
          <p className="text-lg text-white/60 mb-8">{subtitle}</p>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[...Array(3)].map((_, i) => (
              <SkeletonContactCard key={i} />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {contactInfo.map((item) => {
              const IconComponent = iconMap[item.icon] || Mail;
              return (
                <a
                  key={item.label}
                  href={item.link}
                  className="group p-8 border border-white/10 bg-[#141414] text-center hover:border-[#ff006e]/50 hover:bg-[#1a1a1a] transition-colors min-h-[160px] flex flex-col justify-center touch-manipulation"
                >
                  <IconComponent className="w-8 h-8 mx-auto mb-4 text-[#ff006e] group-hover:text-[#ff006e] transition-colors" />
                  <div className="text-xs text-white/40 uppercase tracking-wider mb-2">
                    {item.label}
                  </div>
                  <div className="font-semibold text-white group-hover:text-white transition-colors">
                    {item.value}
                  </div>
                </a>
              );
            })}
          </div>
        )}

        {/* Contact Form */}
        {loading ? (
          <SkeletonForm />
        ) : formEnabled ? (
          <div className="max-w-2xl mx-auto mt-16 p-8 border border-white/10 bg-[#141414]">
            <form className="space-y-6">
              <div>
                <label className="block text-xs uppercase tracking-wider mb-2 text-white/60">
                  Name
                </label>
                <input
                  type="text"
                  className="w-full p-4 border border-white/10 focus:border-[#ff006e] outline-none bg-[#0a0a0a] text-white placeholder:text-white/30 transition-colors min-h-[44px]"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider mb-2 text-white/60">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full p-4 border border-white/10 focus:border-[#ff006e] outline-none bg-[#0a0a0a] text-white placeholder:text-white/30 transition-colors min-h-[44px]"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider mb-2 text-white/60">
                  Message
                </label>
                <textarea
                  rows={4}
                  className="w-full p-4 border border-white/10 focus:border-[#ff006e] outline-none bg-[#0a0a0a] text-white placeholder:text-white/30 transition-colors resize-none"
                  placeholder="Tell me about your project..."
                />
              </div>
              <button
                type="submit"
                className="w-full py-4 bg-[#ff006e] text-white font-semibold border border-[#ff006e] hover:bg-[#ff006e]/90 hover:border-[#ff006e]/90 transition-colors min-h-[44px]"
              >
                Send Message
              </button>
            </form>
          </div>
        ) : null}
      </div>
    </section>
  );
}
