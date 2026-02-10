'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function LoginPage() {
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
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Token is set by backend in cookie, redirect to admin
      router.push('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="text-4xl font-bold tracking-tighter"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            <span className="text-black">CREO</span>
            <span className="text-[#FF2E63]">MOTION</span>
          </Link>
          <p
            className="mt-2 text-sm text-black/60"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            ADMIN PORTAL
          </p>
        </div>

        {/* Login Form */}
        <form
          onSubmit={handleSubmit}
          className="border-2 border-black bg-white p-8"
          style={{ boxShadow: '8px 8px 0 0 #000' }}
        >
          <p
            className="text-xs tracking-[0.2em] text-[#FF2E63] mb-6"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            [AUTHENTICATION REQUIRED]
          </p>

          {/* Error Message */}
          {error && (
            <div
              className="mb-6 p-4 border-2 border-[#FF2E63] bg-[#FF2E63]/10 text-[#FF2E63]"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Email Input */}
          <div className="mb-6">
            <label
              htmlFor="email"
              className="block text-xs tracking-[0.2em] mb-2 uppercase"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              EMAIL *
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="w-full border-2 border-black bg-[#F5F5F0] px-4 py-3 text-sm outline-none focus:bg-black focus:text-[#F5F5F0] transition-colors duration-200 disabled:opacity-50"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
              placeholder="admin@creomotion.com"
            />
          </div>

          {/* Password Input */}
          <div className="mb-8">
            <label
              htmlFor="password"
              className="block text-xs tracking-[0.2em] mb-2 uppercase"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              PASSWORD *
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              className="w-full border-2 border-black bg-[#F5F5F0] px-4 py-3 text-sm outline-none focus:bg-black focus:text-[#F5F5F0] transition-colors duration-200 disabled:opacity-50"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
              placeholder="••••••••"
            />
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={isLoading}
            className="w-full border-2 border-black bg-black text-[#F5F5F0] px-8 py-4 font-bold uppercase tracking-wider disabled:opacity-50"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              boxShadow: '4px 4px 0 0 #FF2E63',
            }}
            whileHover={!isLoading ? {
              x: -2,
              y: -2,
              boxShadow: '6px 6px 0 0 #FF2E63',
            } : {}}
            transition={{ duration: 0.2 }}
          >
            {isLoading ? 'AUTHENTICATING...' : 'LOGIN →'}
          </motion.button>
        </form>

        {/* Back Link */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-black/60 hover:text-[#FF2E63] transition-colors"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            ← BACK TO SITE
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
