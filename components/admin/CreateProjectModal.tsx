'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';

interface Client {
  id: string;
  name: string;
  company?: string;
}

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    description: string;
    clientId: string;
    status: string;
    budget: number | null;
    deadline: string | null;
  }) => Promise<void>;
  clients: Client[];
}

const PROJECT_STATUSES = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'REVIEW', label: 'Review' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'COMPLETED', label: 'Completed' },
];

export default function CreateProjectModal({
  isOpen,
  onClose,
  onSubmit,
  clients,
}: CreateProjectModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [clientId, setClientId] = useState('');
  const [status, setStatus] = useState('DRAFT');
  const [budget, setBudget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !clientId) return;

    setSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim(),
        clientId,
        status,
        budget: budget ? parseFloat(budget) : null,
        deadline: deadline || null,
      });

      // Reset form
      setName('');
      setDescription('');
      setClientId('');
      setStatus('DRAFT');
      setBudget('');
      setDeadline('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
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
              className="w-full max-w-lg max-h-[90vh] bg-[#141414] border border-white/10 overflow-auto rounded-sm"
            >
            {/* Header */}
            <div className="border-b border-white/10 p-4 bg-[#0a0a0a] sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-white font-display font-bold tracking-wider uppercase">
                  New Project
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
              {/* Project Name */}
              <div className="form-group">
                <label htmlFor="project-name" className="block font-mono text-xs text-white/60 uppercase tracking-wider mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  id="project-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter project name"
                  required
                  disabled={submitting}
                  className="w-full border border-white/10 bg-[#1a1a1a] px-4 py-3 text-sm font-mono text-white outline-none focus:border-[#ff006e] transition-all duration-200 disabled:opacity-50 placeholder:text-white/30"
                />
              </div>

              {/* Client Selector */}
              <div className="form-group">
                <label htmlFor="client-select" className="block font-mono text-xs text-white/60 uppercase tracking-wider mb-2">
                  Client *
                </label>
                <select
                  id="client-select"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  required
                  disabled={submitting}
                  className="w-full border border-white/10 bg-[#1a1a1a] px-4 py-3 text-sm font-mono text-white outline-none focus:border-[#ff006e] transition-all duration-200 disabled:opacity-50 appearance-none cursor-pointer"
                >
                  <option value="" className="bg-[#1a1a1a]">Select a client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id} className="bg-[#1a1a1a]">
                      {client.name} {client.company ? `— ${client.company}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div className="form-group">
                <label htmlFor="status-select" className="block font-mono text-xs text-white/60 uppercase tracking-wider mb-2">
                  Status
                </label>
                <select
                  id="status-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  disabled={submitting}
                  className="w-full border border-white/10 bg-[#1a1a1a] px-4 py-3 text-sm font-mono text-white outline-none focus:border-[#ff006e] transition-all duration-200 disabled:opacity-50 appearance-none cursor-pointer"
                >
                  {PROJECT_STATUSES.map((s) => (
                    <option key={s.value} value={s.value} className="bg-[#1a1a1a]">
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="form-group">
                <label htmlFor="description" className="block font-mono text-xs text-white/60 uppercase tracking-wider mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Project description..."
                  rows={3}
                  disabled={submitting}
                  className="w-full border border-white/10 bg-[#1a1a1a] px-4 py-3 text-sm font-mono text-white outline-none focus:border-[#ff006e] transition-all duration-200 resize-none disabled:opacity-50 placeholder:text-white/30"
                />
              </div>

              {/* Budget & Deadline Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label htmlFor="budget" className="block font-mono text-xs text-white/60 uppercase tracking-wider mb-2">
                    Budget €
                  </label>
                  <input
                    type="number"
                    id="budget"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="0"
                    min="0"
                    step="100"
                    disabled={submitting}
                    className="w-full border border-white/10 bg-[#1a1a1a] px-4 py-3 text-sm font-mono text-white outline-none focus:border-[#ff006e] transition-all duration-200 disabled:opacity-50 placeholder:text-white/30"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="deadline" className="block font-mono text-xs text-white/60 uppercase tracking-wider mb-2">
                    Deadline
                  </label>
                  <input
                    type="date"
                    id="deadline"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    disabled={submitting}
                    className="w-full border border-white/10 bg-[#1a1a1a] px-4 py-3 text-sm font-mono text-white outline-none focus:border-[#ff006e] transition-all duration-200 disabled:opacity-50"
                  />
                </div>
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
                  disabled={submitting || !name.trim() || !clientId}
                  className="flex-1 border border-white/10 bg-white/5 px-4 py-3 font-mono font-bold text-sm uppercase tracking-wider text-white hover:bg-[#ff006e] hover:border-[#ff006e] transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Project'
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
