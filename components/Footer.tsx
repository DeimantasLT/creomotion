'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const footerLinks = {
  navigation: [
    { label: 'HOME', href: '/' },
    { label: 'SERVICES', href: '#services' },
    { label: 'PROJECTS', href: '#projects' },
    { label: 'CONTACT', href: '#contact' },
  ],
  admin: [
    { label: 'ADMIN LOGIN', href: '/login' },
    { label: 'CLIENT PORTAL', href: '/portal' },
  ],
};

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-black text-[#F5F5F0] border-t-2 border-black">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <Link
              href="/"
              className="text-3xl font-bold tracking-tighter"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              <span className="text-[#F5F5F0]">CREO</span>
              <span className="text-[#FF2E63]">MOTION</span>
            </Link>
            <p
              className="mt-4 text-sm text-[#F5F5F0]/60"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              Motion Design &amp; AI Video Production
            </p>
            <p
              className="mt-2 text-xs text-[#F5F5F0]/40 tracking-wider"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              VILNIUS, LITHUANIA
            </p>
          </div>

          {/* Navigation Links */}
          <div>
            <h4
              className="text-xs tracking-[0.2em] text-[#FF2E63] mb-4"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              [NAVIGATION]
            </h4>
            <ul className="space-y-2">
              {footerLinks.navigation.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm uppercase hover:text-[#FF2E63] transition-colors duration-200"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Admin Links */}
          <div>
            <h4
              className="text-xs tracking-[0.2em] text-[#FF2E63] mb-4"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              [ACCESS]
            </h4>
            <ul className="space-y-2">
              {footerLinks.admin.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm uppercase hover:text-[#FF2E63] transition-colors duration-200"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t-2 border-[#F5F5F0]/10">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p
              className="text-xs text-[#F5F5F0]/40"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              © {currentYear} CREOMOTION. ALL RIGHTS RESERVED.
            </p>
            
            {/* Status Indicator */}
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#FF2E63] animate-pulse" />
              <span
                className="text-xs tracking-wider"
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

export default Footer;
