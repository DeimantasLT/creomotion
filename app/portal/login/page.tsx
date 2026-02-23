'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

const PALETTE = {
  pink: "#ff006e",
  purple: "#8338ec",
};

export default function PortalLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/portal-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      router.push('/portal');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute top-1/4 -right-1/4 w-[600px] h-[600px] rounded-full opacity-20 blur-[150px]"
          style={{ background: `radial-gradient(circle, ${PALETTE.pink}, transparent)` }}
        />
        <div 
          className="absolute -bottom-1/4 -left-1/4 w-[400px] h-[400px] rounded-full opacity-15 blur-[100px]"
          style={{ background: `radial-gradient(circle, ${PALETTE.purple}, transparent)` }}
        />
      </div>

      <motion.div
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Logo */}
        <div className="text-center mb-12">
          <Link href="/" className="text-4xl font-bold tracking-widest">
            <span className="text-white/80">CREO</span>
            <span style={{ color: PALETTE.pink }}>MOTION</span>
          </Link>
          <p className="mt-2 text-xs font-mono text-white/40 tracking-[0.3em]">
            CLIENT PORTAL
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="border border-white/10 bg-white/5 backdrop-blur-sm p-8 rounded-sm">
          <p className="text-xs font-mono tracking-[0.3em] mb-8" style={{ color: PALETTE.pink }}>
            [CLIENT ACCESS]
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 border border-[#ff006e]/30 bg-[#ff006e]/10 text-[#ff006e] font-mono text-sm">
              {error}
            </div>
          )}

          {/* Email Input */}
          <div className="mb-6">
            <label htmlFor="email" className="block text-xs font-mono tracking-widest mb-2 text-white/60">
              EMAIL *
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="w-full bg-transparent border-b border-white/20 px-0 py-3 text-white font-mono text-sm outline-none focus:border-[#ff006e] transition-colors placeholder:text-white/20"
              placeholder="client@example.com"
            />
          </div>

          {/* Password Input */}
          <div className="mb-8">
            <label htmlFor="password" className="block text-xs font-mono tracking-widest mb-2 text-white/60">
              PASSWORD *
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              className="w-full bg-transparent border-b border-white/20 px-0 py-3 text-white font-mono text-sm outline-none focus:border-[#ff006e] transition-colors placeholder:text-white/20"
              placeholder="••••••••"
            />
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={isLoading}
            className="w-full px-8 py-4 font-bold font-mono text-sm tracking-widest rounded-sm disabled:opacity-50 transition-all"
            style={{
              background: `linear-gradient(90deg, ${PALETTE.pink}, ${PALETTE.purple})`,
              color: '#0a0a0a',
            }}
            whileHover={!isLoading ? { scale: 1.02 } : {}}
          >
            {isLoading ? 'LOGGING IN...' : 'ACCESS PORTAL →'}
          </motion.button>
        </form>

        {/* Back Link */}
        <div className="mt-8 text-center">
          <Link href="/" className="text-xs font-mono text-white/30 hover:text-white transition-colors tracking-widest">
            ← BACK TO SITE
          </Link>
        </div>
      </motion.div>

      {/* Footer */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <p className="text-[10px] font-mono text-white/20 tracking-widest">
          © 2025 CREOMOTION · CLIENT AREA
        </p>
      </div>
    </div>
  );
}
