'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Building2, Mail, Phone, User } from 'lucide-react';

interface CreateClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    email: string;
    company: string;
    phone: string;
  }) => Promise<void>;
}

export default function CreateClientModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateClientModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        name: name.trim(),
        email: email.trim(),
        company: company.trim(),
        phone: phone.trim(),
      });

      // Reset form
      setName('');
      setEmail('');
      setCompany('');
      setPhone('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create client');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setError(null);
      onClose();
    }
  };

  const isEmailValid = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const canSubmit = name.trim() && email.trim() && isEmailValid(email);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md bg-white border-2 border-black z-50 overflow-auto shadow-brutalist-lg"
          >
            {/* Header */}
            <div className="border-b-2 border-black p-4 bg-black sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-white font-display font-bold tracking-wider uppercase">
                  New Client
                </h2>
                <button
                  onClick={handleClose}
                  disabled={submitting}
                  className="p-1 text-white hover:text-coral transition-colors duration-200 disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Name */}
              <div className="form-group">
                <label htmlFor="client-name" className="block font-mono text-xs text-gray-500 uppercase tracking-wider mb-2">
                  <span className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Full Name *
                  </span>
                </label>
                <input
                  type="text"
                  id="client-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Client's full name"
                  required
                  disabled={submitting}
                  className="w-full border-2 border-black bg-[#F5F5F0] px-4 py-3 text-sm font-mono outline-none focus:bg-black focus:text-white transition-all duration-200 disabled:opacity-50"
                />
              </div>

              {/* Email */}
              <div className="form-group">
                <label htmlFor="client-email" className="block font-mono text-xs text-gray-500 uppercase tracking-wider mb-2">
                  <span className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email *
                  </span>
                </label>
                <input
                  type="email"
                  id="client-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="client@company.com"
                  required
                  disabled={submitting}
                  className="w-full border-2 border-black bg-[#F5F5F0] px-4 py-3 text-sm font-mono outline-none focus:bg-black focus:text-white transition-all duration-200 disabled:opacity-50"
                />
              </div>

              {/* Company */}
              <div className="form-group">
                <label htmlFor="client-company" className="block font-mono text-xs text-gray-500 uppercase tracking-wider mb-2">
                  <span className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Company
                  </span>
                </label>
                <input
                  type="text"
                  id="client-company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Company name (optional)"
                  disabled={submitting}
                  className="w-full border-2 border-black bg-[#F5F5F0] px-4 py-3 text-sm font-mono outline-none focus:bg-black focus:text-white transition-all duration-200 disabled:opacity-50"
                />
              </div>

              {/* Phone */}
              <div className="form-group">
                <label htmlFor="client-phone" className="block font-mono text-xs text-gray-500 uppercase tracking-wider mb-2">
                  <span className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone
                  </span>
                </label>
                <input
                  type="tel"
                  id="client-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone number (optional)"
                  disabled={submitting}
                  className="w-full border-2 border-black bg-[#F5F5F0] px-4 py-3 text-sm font-mono outline-none focus:bg-black focus:text-white transition-all duration-200 disabled:opacity-50"
                />
              </div>

              {/* Error Display */}
              {error && (
                <div className="p-3 border-2 border-black bg-coral text-white animate-fade-in">
                  <p className="text-xs font-mono">[ERROR: {error}]</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={submitting}
                  className="flex-1 border-2 border-black bg-[#F5F5F0] px-4 py-3 font-mono font-bold text-sm uppercase tracking-wider hover:bg-coral hover:text-white hover:border-coral transition-all duration-200 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !canSubmit}
                  className="flex-1 border-2 border-black bg-black text-white px-4 py-3 font-mono font-bold text-sm uppercase tracking-wider hover:bg-coral hover:border-coral transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Client'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
