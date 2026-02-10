'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const navLinks = [
  { href: '#services', label: 'Services' },
  { href: '#projects', label: 'Projects' },
  { href: '#contact', label: 'Contact' },
];

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
          isScrolled 
            ? 'bg-[#F5F5F0]/95 border-b-2 border-black backdrop-blur-sm' 
            : 'bg-transparent border-b-2 border-transparent'
        }`}
      >
        <div className="container-brutalist">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link
              href="/"
              className="font-display text-2xl font-bold tracking-tighter hover:opacity-80 transition-opacity"
            >
              <span className="text-black">CREO</span>
              <span className="text-coral">MOTION</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="font-mono text-sm font-semibold uppercase tracking-wider text-black hover:text-coral transition-colors duration-200"
                >
                  {link.label}
                </a>
              ))}
              
              <div className="h-6 w-px bg-black/20" />
              
              <div className="flex items-center gap-4">
                <Link
                  href="/login"
                  className="font-mono text-sm font-semibold uppercase tracking-wider text-black hover:text-coral transition-colors duration-200"
                >
                  Admin
                </Link>
                <Link
                  href="/portal"
                  className="px-4 py-2 font-mono text-sm font-semibold uppercase tracking-wider bg-black text-white border-2 border-black hover:bg-coral hover:border-coral transition-all duration-200"
                >
                  Portal
                </Link>
              </div>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden w-12 h-12 border-2 border-black bg-[#F5F5F0] flex items-center justify-center text-black hover:bg-black hover:text-[#F5F5F0] active:translate-y-px transition-all duration-200"
              style={{ boxShadow: '4px 4px 0 0 #000' }}
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={isMobileMenuOpen}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/20 z-40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            {/* Menu Panel */}
            <motion.div
              className="fixed inset-0 z-50 bg-[#F5F5F0] md:hidden"
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            >
              <div className="flex flex-col h-full">
                {/* Mobile Header */}
                <div className="flex items-center justify-between px-4 sm:px-6 h-20 border-b-2 border-black">
                  <Link
                    href="/"
                    className="font-display text-2xl font-bold tracking-tighter"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="text-black">CREO</span>
                    <span className="text-coral">MOTION</span>
                  </Link>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-12 h-12 border-2 border-black bg-black text-[#F5F5F0] flex items-center justify-center hover:bg-coral hover:border-coral transition-colors"
                    aria-label="Close menu"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Mobile Nav Links */}
                <nav className="flex-1 flex flex-col p-4 sm:p-6 overflow-y-auto">
                  {navLinks.map((link, index) => (
                    <motion.a
                      key={link.href}
                      href={link.href}
                      className="block py-6 text-3xl sm:text-4xl font-display font-bold uppercase border-b-2 border-black/10 text-black hover:text-coral transition-colors"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.3 }}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.label}
                    </motion.a>
                  ))}
                  
                  <div className="mt-auto space-y-4 pt-8">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.3 }}
                    >
                      <Link
                        href="/login"
                        className="block w-full py-4 border-2 border-black bg-black text-[#F5F5F0] text-center font-mono font-bold uppercase tracking-wider hover:bg-coral hover:border-coral transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Admin Login
                      </Link>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.3 }}
                    >
                      <Link
                        href="/portal"
                        className="block w-full py-4 border-2 border-black text-black text-center font-mono font-bold uppercase tracking-wider hover:bg-black hover:text-[#F5F5F0] transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Client Portal
                      </Link>
                    </motion.div>
                  </div>
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default Navigation;
