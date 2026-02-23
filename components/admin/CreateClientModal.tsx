'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Building2, Mail, Phone, User, Lock, Eye, EyeOff, RefreshCw, Hash, FileText, MapPin, Building } from 'lucide-react';

interface CreateClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    email: string;
    company: string;
    phone: string;
    password: string;
    address?: string;
    city?: string;
    companyCode?: string;
    vatCode?: string;
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
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [companyCode, setCompanyCode] = useState('');
  const [vatCode, setVatCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(result);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        name: name.trim(),
        email: email.trim(),
        company: company.trim(),
        phone: phone.trim(),
        password: password.trim(),
        address: address.trim() || undefined,
        city: city.trim() || undefined,
        companyCode: companyCode.trim() || undefined,
        vatCode: vatCode.trim() || undefined,
      });

      // Reset form
      setName('');
      setEmail('');
      setCompany('');
      setPhone('');
      setPassword('');
      setAddress('');
      setCity('');
      setCompanyCode('');
      setVatCode('');
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
      setPassword('');
      setShowPassword(false);
      setCompanyCode('');
      setVatCode('');
      onClose();
    }
  };

  const isEmailValid = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const canSubmit = name.trim() && email.trim() && isEmailValid(email) && password.length >= 6;

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

          {/* Modal Wrapper */}
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md max-h-[90vh] bg-[#141414] border border-white/10 overflow-auto rounded-sm"
            >
            {/* Header */}
            <div className="border-b border-white/10 p-4 bg-[#0a0a0a] sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-white font-display font-bold tracking-wider uppercase">
                  New Client
                </h2>
                <button
                  onClick={handleClose}
                  disabled={submitting}
                  className="p-1 text-white/60 hover:text-[#ff006e] transition-colors duration-200 disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Name */}
              <div className="form-group">
                <label htmlFor="client-name" className="block font-mono text-xs text-white/60 uppercase tracking-wider mb-2">
                  <span className="flex items-center gap-2">
                    <User className="w-4 h-4 text-white/40" />
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
                  className="w-full border border-white/10 bg-[#1a1a1a] px-4 py-3 text-sm font-mono text-white outline-none focus:border-[#ff006e] transition-all duration-200 disabled:opacity-50 placeholder:text-white/30"
                />
              </div>

              {/* Email */}
              <div className="form-group">
                <label htmlFor="client-email" className="block font-mono text-xs text-white/60 uppercase tracking-wider mb-2">
                  <span className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-white/40" />
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
                  className="w-full border border-white/10 bg-[#1a1a1a] px-4 py-3 text-sm font-mono text-white outline-none focus:border-[#ff006e] transition-all duration-200 disabled:opacity-50 placeholder:text-white/30"
                />
              </div>

              {/* Company */}
              <div className="form-group">
                <label htmlFor="client-company" className="block font-mono text-xs text-white/60 uppercase tracking-wider mb-2">
                  <span className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-white/40" />
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
                  className="w-full border border-white/10 bg-[#1a1a1a] px-4 py-3 text-sm font-mono text-white outline-none focus:border-[#ff006e] transition-all duration-200 disabled:opacity-50 placeholder:text-white/30"
                />
              </div>

              {/* Phone */}
              <div className="form-group">
                <label htmlFor="client-phone" className="block font-mono text-xs text-white/60 uppercase tracking-wider mb-2">
                  <span className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-white/40" />
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
                  className="w-full border border-white/10 bg-[#1a1a1a] px-4 py-3 text-sm font-mono text-white outline-none focus:border-[#ff006e] transition-all duration-200 disabled:opacity-50 placeholder:text-white/30"
                />
              </div>

              {/* Address */}
              <div className="form-group">
                <label htmlFor="client-address" className="block font-mono text-xs text-white/60 uppercase tracking-wider mb-2">
                  <span className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-white/40" />
                    Address
                  </span>
                </label>
                <input
                  type="text"
                  id="client-address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street address (optional)"
                  disabled={submitting}
                  className="w-full border border-white/10 bg-[#1a1a1a] px-4 py-3 text-sm font-mono text-white outline-none focus:border-[#ff006e] transition-all duration-200 disabled:opacity-50 placeholder:text-white/30"
                />
              </div>

              {/* City */}
              <div className="form-group">
                <label htmlFor="client-city" className="block font-mono text-xs text-white/60 uppercase tracking-wider mb-2">
                  <span className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-white/40" />
                    City
                  </span>
                </label>
                <input
                  type="text"
                  id="client-city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City (optional)"
                  disabled={submitting}
                  className="w-full border border-white/10 bg-[#1a1a1a] px-4 py-3 text-sm font-mono text-white outline-none focus:border-[#ff006e] transition-all duration-200 disabled:opacity-50 placeholder:text-white/30"
                />
              </div>

              {/* Divider */}
              <div className="border-t border-white/10 pt-4">
                <p className="text-xs font-mono text-[#ff006e] uppercase tracking-wider mb-2">Portal Access</p>
              </div>

              {/* Password */}
              <div className="form-group">
                <label htmlFor="client-password" className="block font-mono text-xs text-white/60 uppercase tracking-wider mb-2">
                  <span className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-white/40" />
                    Password *
                  </span>
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="client-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      required
                      disabled={submitting}
                      className="w-full border border-white/10 bg-[#1a1a1a] px-4 py-3 pr-10 text-sm font-mono text-white outline-none focus:border-[#ff006e] transition-all duration-200 disabled:opacity-50 placeholder:text-white/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    disabled={submitting}
                    className="border border-white/10 bg-[#1a1a1a] px-3 py-2 text-white/60 hover:bg-[#ff006e]/20 hover:border-[#ff006e] hover:text-white transition-all duration-200 disabled:opacity-50"
                    title="Generate random password"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs font-mono text-white/30 mt-1">Required for portal access</p>
              </div>

              {/* Divider */}
              <div className="border-t border-white/10 pt-4">
                <p className="text-xs font-mono text-white/60 uppercase tracking-wider mb-2">Company Details</p>
              </div>

              {/* Company Code */}
              <div className="form-group">
                <label htmlFor="client-company-code" className="block font-mono text-xs text-white/60 uppercase tracking-wider mb-2">
                  <span className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-white/40" />
                    Company Code
                  </span>
                </label>
                <input
                  type="text"
                  id="client-company-code"
                  value={companyCode}
                  onChange={(e) => setCompanyCode(e.target.value)}
                  placeholder="Company registration code"
                  disabled={submitting}
                  className="w-full border border-white/10 bg-[#1a1a1a] px-4 py-3 text-sm font-mono text-white outline-none focus:border-[#ff006e] transition-all duration-200 disabled:opacity-50 placeholder:text-white/30"
                />
              </div>

              {/* VAT Code */}
              <div className="form-group">
                <label htmlFor="client-vat-code" className="block font-mono text-xs text-white/60 uppercase tracking-wider mb-2">
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-white/40" />
                    VAT Code
                  </span>
                </label>
                <input
                  type="text"
                  id="client-vat-code"
                  value={vatCode}
                  onChange={(e) => setVatCode(e.target.value)}
                  placeholder="VAT/Tax registration number"
                  disabled={submitting}
                  className="w-full border border-white/10 bg-[#1a1a1a] px-4 py-3 text-sm font-mono text-white outline-none focus:border-[#ff006e] transition-all duration-200 disabled:opacity-50 placeholder:text-white/30"
                />
              </div>

              {/* Error Display */}
              {error && (
                <div className="p-3 border border-[#ff006e]/30 bg-[#ff006e]/10 text-[#ff006e] animate-fade-in">
                  <p className="text-xs font-mono">[ERROR: {error}]</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={submitting}
                  className="flex-1 border border-white/10 bg-[#1a1a1a] px-4 py-3 font-mono font-bold text-sm uppercase tracking-wider text-white hover:bg-white/10 hover:border-[#ff006e] hover:text-[#ff006e] transition-all duration-200 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !canSubmit}
                  className="flex-1 border border-white/10 bg-white/5 px-4 py-3 font-mono font-bold text-sm uppercase tracking-wider text-white hover:bg-[#ff006e] hover:border-[#ff006e] transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
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
        </div>
      </>
      )}
    </AnimatePresence>
  );
}
