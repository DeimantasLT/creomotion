"use client";

import { motion } from "framer-motion";
import { Mail, MapPin, ArrowUpRight } from "lucide-react";

export function ContactMinimal() {
  return (
    <section className="w-full bg-[#F5F5F0] py-16 md:py-24" id="contact">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Section Header */}
        <div className="border-b-2 border-black pb-6 mb-12">
          <div className="flex items-end justify-between">
            <div>
              <p 
                className="text-xs tracking-[0.3em] mb-2 text-black/60"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                [GET IN TOUCH]
              </p>
              <h2 
                className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-black"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                CONTACT
              </h2>
            </div>
            <p 
              className="text-xs md:text-sm text-black/60 hidden md:block"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              07 / CONTACT
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
          {/* Left - CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p 
              className="text-lg md:text-xl lg:text-2xl leading-relaxed mb-8 max-w-lg"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              Ready to accelerate your video production with AI-enhanced workflows? 
              Let&apos;s create something exceptional together.
            </p>

            {/* Large Email CTA */}
            <motion.a
              href="mailto:hello@creomotion.studio"
              className="group inline-flex items-center gap-4 border-2 border-black bg-black text-[#F5F5F0] px-6 md:px-8 py-4 md:py-6 hover:bg-[#FF2E63] hover:border-[#FF2E63] transition-all duration-300"
              style={{ boxShadow: "8px 8px 0 0 #000" }}
              whileHover={{ x: 4, y: 4, boxShadow: "4px 4px 0 0 #000" }}
            >
              <Mail className="w-6 h-6 md:w-8 md:h-8" />
              <span 
                className="text-lg md:text-2xl font-bold tracking-tight"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                HELLO@CREOMOTION.STUDIO
              </span>
              <ArrowUpRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
            </motion.a>

            {/* Availability Badge */}
            <motion.div
              className="mt-8 inline-flex items-center gap-3 border-2 border-black px-4 py-2"
              style={{ boxShadow: "4px 4px 0 0 #FF2E63" }}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <span className="w-3 h-3 bg-[#FF2E63] animate-pulse" />
              <span
                className="text-xs tracking-[0.2em] uppercase"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                ACCEPTING NEW PROJECTS
              </span>
            </motion.div>
          </motion.div>

          {/* Right - Info */}
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* Location */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-[#FF2E63]" />
                <p 
                  className="text-xs tracking-[0.2em] text-black/60"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  [LOCATION]
                </p>
              </div>
              <p 
                className="text-xl md:text-2xl font-bold text-black"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                VILNIUS, LITHUANIA
              </p>
              <p 
                className="text-sm text-black/60 mt-1"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                Working with clients worldwide
              </p>
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-2 gap-6 pt-6 border-t-2 border-black">
              <div>
                <p 
                  className="text-xs tracking-[0.2em] text-black/60 mb-2"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  [RESPONSE TIME]
                </p>
                <p 
                  className="text-lg font-bold text-black"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  24 HOURS
                </p>
              </div>
              <div>
                <p 
                  className="text-xs tracking-[0.2em] text-black/60 mb-2"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  [AVAILABILITY]
                </p>
                <p 
                  className="text-lg font-bold text-black"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  MON — FRI
                </p>
              </div>
            </div>

            {/* Social Links */}
            <div className="pt-6 border-t-2 border-black">
              <p 
                className="text-xs tracking-[0.2em] text-black/60 mb-4"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                [FOLLOW]
              </p>
              <div className="flex flex-wrap gap-3">
                {["INSTAGRAM", "LINKEDIN", "BEHANCE", "VIMEO"].map((social) => (
                  <motion.a
                    key={social}
                    href="#"
                    className="border-2 border-black px-4 py-2 text-sm font-bold text-black bg-[#F5F5F0] hover:bg-black hover:text-[#F5F5F0] transition-colors duration-300"
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      boxShadow: "4px 4px 0 0 #000",
                    }}
                    whileHover={{ x: 2, y: 2, boxShadow: "2px 2px 0 0 #000" }}
                  >
                    {social}
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default ContactMinimal;
