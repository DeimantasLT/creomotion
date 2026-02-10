'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Trash2, Building2, Mail, Phone, User } from 'lucide-react';
import type { Client } from '@/types';

interface ClientWithCounts extends Client {
  _count?: {
    projects: number;
    invoices: number;
  };
}

interface EditClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, data: {
    name?: string;
    email?: string;
    company?: string;
    phone?: string;
  }) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  client: ClientWithCounts | null;
}

export default function EditClientModal({
  isOpen,
  onClose,
  onSubmit,
  onDelete,
  client,
}: EditClientModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (client) {
      setName(client.name);
      setEmail(client.email);
      setCompany(client.company || '');
      setPhone(client.phone || '');
    }
  }, [client]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client || !name.trim() || !email.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const updateData: any = {};

      if (name.trim() !== client.name) updateData.name = name.trim();
      if (email.trim() !== client.email) updateData.email = email.trim();
      if (company.trim() !== (client.company || '')) updateData.company = company.trim() || null;
      if (phone.trim() !== (client.phone || '')) updateData.phone = phone.trim() || null;

      if (Object.keys(updateData).length === 0) {
        onClose();
        return;
      }

      await onSubmit(client.id, updateData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update client');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!client || !onDelete) return;

    setDeleting(true);
    setError(null);

    try {
      await onDelete(client.id);
      setShowDeleteConfirm(false);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete client');
    } finally {
      setDeleting(false);
    }
  };

  const handleClose = () => {
    if (!submitting && !deleting) {
      setError(null);
      setShowDeleteConfirm(false);
      onClose();
    }
  };

  const isEmailValid = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const canSubmit = name.trim() && email.trim() && isEmailValid(email);

  if (!client) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md bg-white border-2 border-black z-50 overflow-auto shadow-brutalist-lg"
          >
            {/* Header */}
            <div className="border-b-2 border-black p-4 bg-black sticky top-0">
              <div className="flex items-center justify-between">
                <h2 className="text-white font-display font-bold tracking-wider uppercase">
                  Edit Client
                </h2>
                <button
                  onClick={handleClose}
                  disabled={submitting || deleting}
                  className="p-1 text-white hover:text-coral transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Name */}
              <div className="form-group">
                <label className="block font-mono text-xs text-gray-500 uppercase tracking-wider mb-2">
                  <span className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Full Name *
                  </span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Client's full name"
                  required
                  disabled={submitting}
                  className="w-full border-2 border-black bg-[#F5F5F0] px-4 py-3 text-sm font-mono outline-none focus:bg-black focus:text-white transition-colors disabled:opacity-50"
                />
              </div>

              {/* Email */}
              <div className="form-group">
                <label className="block font-mono text-xs text-gray-500 uppercase tracking-wider mb-2">
                  <span className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email *
                  </span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="client@company.com"
                  required
                  disabled={submitting}
                  className="w-full border-2 border-black bg-[#F5F5F0] px-4 py-3 text-sm font-mono outline-none focus:bg-black focus:text-white transition-colors disabled:opacity-50"
                />
              </div>

              {/* Company */}
              <div className="form-group">
                <label className="block font-mono text-xs text-gray-500 uppercase tracking-wider mb-2">
                  <span className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Company
                  </span>
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Company name (optional)"
                  disabled={submitting}
                  className="w-full border-2 border-black bg-[#F5F5F0] px-4 py-3 text-sm font-mono outline-none focus:bg-black focus:text-white transition-colors disabled:opacity-50"
                />
              </div>

              {/* Phone */}
              <div className="form-group">
                <label className="block font-mono text-xs text-gray-500 uppercase tracking-wider mb-2">
                  <span className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone
                  </span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone number (optional)"
                  disabled={submitting}
                  className="w-full border-2 border-black bg-[#F5F5F0] px-4 py-3 text-sm font-mono outline-none focus:bg-black focus:text-white transition-colors disabled:opacity-50"
                />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 p-4 border-2 border-black bg-[#F5F5F0]">
                <div>
                  <span className="text-xs text-gray-500 font-mono uppercase block mb-1">Projects</span>
                  <span className="text-2xl font-display font-bold">{client._count?.projects || 0}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 font-mono uppercase block mb-1">Invoices</span>
                  <span className="text-2xl font-display font-bold">{client._count?.invoices || 0}</span>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="p-3 border-2 border-black bg-coral text-white animate-fade-in">
                  <p className="text-xs font-mono">[ERROR: {error}]</p>
                </div>
              )}

              {/* Delete Confirm */}
              {showDeleteConfirm && onDelete && (
                <div className="p-4 border-2 border-black bg-red-50 animate-fade-in">
                  <p className="text-sm font-mono mb-2">DELETE THIS CLIENT?</p>
                  {client._count && client._count.projects > 0 && (
                    <p className="text-xs text-coral font-mono mb-3">
                      Warning: Client has {client._count.projects} project(s). You must delete or reassign projects first.
                    </p>
                  )}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      disabled={deleting}
                      className="flex-1 border-2 border-black bg-white px-3 py-2 text-xs font-mono font-bold hover:bg-black hover:text-white transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={deleting || (client._count?.projects || 0) > 0}
                      className="flex-1 border-2 border-black bg-coral text-white px-3 py-2 text-xs font-mono font-bold hover:bg-black transition-colors disabled:opacity-50"
                    >
                      {deleting ? 'DELETING...' : 'YES, DELETE'}
                    </button>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                {onDelete && !showDeleteConfirm && (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={submitting}
                    className="border-2 border-black bg-[#F5F5F0] px-3 py-3 text-coral hover:bg-coral hover:text-white hover:border-coral transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}

                <div className="flex-1" />

                <button
                  type="button"
                  onClick={handleClose}
                  disabled={submitting || deleting}
                  className="border-2 border-black bg-[#F5F5F0] px-4 py-3 font-mono font-bold text-sm uppercase tracking-wider hover:bg-coral hover:text-white hover:border-coral transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || deleting || !canSubmit}
                  className="border-2 border-black bg-black text-white px-4 py-3 font-mono font-bold text-sm uppercase tracking-wider hover:bg-coral hover:border-coral transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      SAVING...
                    </>
                  ) : (
                    'Save Changes'
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
