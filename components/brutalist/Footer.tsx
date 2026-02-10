"use client";

import { motion } from "framer-motion";

const footerLinks = {
  navigation: [
    { label: "HOME", href: "#" },
    { label: "WORK", href: "#work" },
    { label: "SERVICES", href: "#services" },
    { label: "ABOUT", href: "#about" },
    { label: "CONTACT", href: "#contact" },
  ],
  services: [
    { label: "BRAND IDENTITY", href: "#" },
    { label: "WEB DEVELOPMENT", href: "#" },
    { label: "MOTION DESIGN", href: "#" },
    { label: "CREATIVE DIRECTION", href: "#" },
  ],
  social: [
    { label: "INSTAGRAM", href: "#" },
    { label: "TWITTER", href: "#" },
    { label: "LINKEDIN", href: "#" },
    { label: "BEHANCE", href: "#" },
    { label: "DRIBBBLE", href: "#" },
  ],
  legal: [
    { label: "PRIVACY POLICY", href: "#" },
    { label: "TERMS OF SERVICE", href: "#" },
    { label: "COOKIES", href: "#" },
  ],
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-black text-[#F5F5F0]">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {/* Brand */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <h3
              className="text-3xl font-bold tracking-tighter mb-4"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              CREOMOTION
            </h3>
            <p
              className="text-sm text-[#F5F5F0]/60 mb-6"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              RAW DESIGN.
              <br />
              SHARP EXECUTION.
            </p>
            <p
              className="text-xs tracking-[0.2em] text-[#F5F5F0]/40"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              VILNIUS, LT
            </p>
          </motion.div>

          {/* Navigation */}
          <motion.div variants={itemVariants}>
            <h4
              className="text-xs tracking-[0.2em] text-[#FF2E63] mb-4"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              [NAVIGATION]
            </h4>
            <ul className="space-y-2">
              {footerLinks.navigation.map((link) => (
                <li key={link.label}>
                  <motion.a
                    href={link.href}
                    className="text-sm uppercase hover:text-[#FF2E63] transition-colors duration-200 block"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.2 }}
                  >
                    {link.label}
                  </motion.a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Services */}
          <motion.div variants={itemVariants}>
            <h4
              className="text-xs tracking-[0.2em] text-[#FF2E63] mb-4"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              [SERVICES]
            </h4>
            <ul className="space-y-2">
              {footerLinks.services.map((link) => (
                <li key={link.label}>
                  <motion.a
                    href={link.href}
                    className="text-sm uppercase hover:text-[#FF2E63] transition-colors duration-200 block"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.2 }}
                  >
                    {link.label}
                  </motion.a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Social */}
          <motion.div variants={itemVariants}>
            <h4
              className="text-xs tracking-[0.2em] text-[#FF2E63] mb-4"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              [SOCIAL]
            </h4>
            <ul className="space-y-2">
              {footerLinks.social.map((link) => (
                <li key={link.label}>
                  <motion.a
                    href={link.href}
                    className="text-sm uppercase hover:text-[#FF2E63] transition-colors duration-200 block"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.2 }}
                  >
                    {link.label} ↗
                  </motion.a>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>

        {/* Back to Top */}
        <motion.div
          className="mt-16 flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <motion.a
            href="#"
            className="group flex flex-col items-center gap-2"
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="w-12 h-12 border-2 border-[#F5F5F0] flex items-center justify-center bg-black"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
            </motion.div>
            <span
              className="text-xs tracking-[0.2em] uppercase"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              BACK TO TOP
            </span>
          </motion.a>
        </motion.div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t-2 border-[#F5F5F0]/20">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <p
              className="text-xs tracking-[0.1em] text-[#F5F5F0]/40"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              © {currentYear} CREOMOTION. ALL RIGHTS RESERVED.
            </p>

            {/* Legal Links */}
            <div className="flex items-center gap-6">
              {footerLinks.legal.map((link, index) => (
                <span key={link.label} className="flex items-center gap-6">
                  <motion.a
                    href={link.href}
                    className="text-xs uppercase text-[#F5F5F0]/40 hover:text-[#F5F5F0] transition-colors duration-200"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.2 }}
                  >
                    {link.label}
                  </motion.a>
                  {index < footerLinks.legal.length - 1 && (
                    <span className="text-[#F5F5F0]/20">/</span>
                  )}
                </span>
              ))}
            </div>

            {/* Status Badge */}
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#FF2E63] animate-pulse" />
              <span
                className="text-xs tracking-[0.1em] uppercase"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                SYSTEM ONLINE
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

