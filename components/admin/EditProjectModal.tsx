'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Trash2, Archive } from 'lucide-react';
import type { Project } from '@/types';

interface Client {
  id: string;
  name: string;
  company?: string;
}

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, data: {
    name?: string;
    description?: string;
    clientId?: string;
    status?: string;
    budget?: number;
    deadline?: string;
  }) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  project: Project | null;
  clients: Client[];
}

const PROJECT_STATUSES = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'REVIEW', label: 'Review' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'COMPLETED', label: 'Completed' },
];

export default function EditProjectModal({
  isOpen,
  onClose,
  onSubmit,
  onDelete,
  project,
  clients,
}: EditProjectModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [clientId, setClientId] = useState('');
  const [status, setStatus] = useState('DRAFT');
  const [budget, setBudget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description || '');
      setClientId(project.clientId);
      setStatus(project.status);
      setBudget(project.budget?.toString() || '');
      setDeadline(project.deadline ? new Date(project.deadline).toISOString().split('T')[0] : '');
    }
  }, [project]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !name.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const updateData: any = {};

      if (name.trim() !== project.name) updateData.name = name.trim();
      if (description.trim() !== (project.description || '')) updateData.description = description.trim();
      if (clientId !== project.clientId) updateData.clientId = clientId;
      if (status !== project.status) updateData.status = status;
      const budgetNum = budget ? parseFloat(budget) : null;
      if (budgetNum !== (project.budget || null)) updateData.budget = budgetNum;
      const deadlineVal = deadline || null;
      const currentDeadline = project.deadline ? new Date(project.deadline).toISOString().split('T')[0] : null;
      if (deadlineVal !== currentDeadline) updateData.deadline = deadlineVal;

      if (Object.keys(updateData).length === 0) {
        onClose();
        return;
      }

      await onSubmit(project.id, updateData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update project');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!project || !onDelete) return;

    setDeleting(true);
    setError(null);

    try {
      await onDelete(project.id);
      setShowDeleteConfirm(false);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete project');
    } finally {
      setDeleting(false);
    }
  };

  const handleArchive = async () => {
    if (!project) return;

    setSubmitting(true);
    setError(null);

    try {
      await onSubmit(project.id, { status: 'COMPLETED' });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to archive project');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting && !deleting) {
      setError(null);
      setShowDeleteConfirm(false);
      onClose();
    }
  };

  if (!project) return null;

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
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg bg-white border-2 border-black z-50 overflow-auto md:max-h-[90vh] shadow-brutalist-lg"
          >
            {/* Header */}
            <div className="border-b-2 border-black p-4 bg-black sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-white font-display font-bold tracking-wider uppercase">
                  Edit Project
                </h2>
                <button
                  onClick={handleClose}
                  disabled={submitting || deleting}
                  className="p-1 text-white hover:text-coral transition-colors duration-200 disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Project Name */}
              <div className="form-group">
                <label className="block font-mono text-xs text-gray-500 uppercase tracking-wider mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter project name"
                  required
                  disabled={submitting}
                  className="w-full border-2 border-black bg-[#F5F5F0] px-4 py-3 text-sm font-mono outline-none focus:bg-black focus:text-white transition-all duration-200 disabled:opacity-50"
                />
              </div>

              {/* Client */}
              <div className="form-group">
                <label className="block font-mono text-xs text-gray-500 uppercase tracking-wider mb-2">
                  Client *
                </label>
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  required
                  disabled={submitting}
                  className="w-full border-2 border-black bg-[#F5F5F0] px-4 py-3 text-sm font-mono outline-none focus:bg-black focus:text-white transition-all duration-200 appearance-none disabled:opacity-50"
                >
                  <option value="">Select a client</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.company ? `— ${c.company}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div className="form-group">
                <label className="block font-mono text-xs text-gray-500 uppercase tracking-wider mb-2">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  disabled={submitting}
                  className="w-full border-2 border-black bg-[#F5F5F0] px-4 py-3 text-sm font-mono outline-none focus:bg-black focus:text-white transition-all duration-200 appearance-none disabled:opacity-50"
                >
                  {PROJECT_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="form-group">
                <label className="block font-mono text-xs text-gray-500 uppercase tracking-wider mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Project description..."
                  rows={3}
                  disabled={submitting}
                  className="w-full border-2 border-black bg-[#F5F5F0] px-4 py-3 text-sm font-mono outline-none focus:bg-black focus:text-white transition-all duration-200 resize-none disabled:opacity-50"
                />
              </div>

              {/* Budget & Deadline */}
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="block font-mono text-xs text-gray-500 uppercase tracking-wider mb-2">
                    Budget €
                  </label>
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="0"
                    min="0"
                    step="100"
                    disabled={submitting}
                    className="w-full border-2 border-black bg-[#F5F5F0] px-4 py-3 text-sm font-mono outline-none focus:bg-black focus:text-white transition-all duration-200 disabled:opacity-50"
                  />
                </div>

                <div className="form-group">
                  <label className="block font-mono text-xs text-gray-500 uppercase tracking-wider mb-2">
                    Deadline
                  </label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    disabled={submitting}
                    className="w-full border-2 border-black bg-[#F5F5F0] px-4 py-3 text-sm font-mono outline-none focus:bg-black focus:text-white transition-all duration-200 disabled:opacity-50"
                  />
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
                  <p className="text-sm font-mono mb-3">
                    DELETE THIS PROJECT?
                  </p>
                  <p className="text-xs text-coral font-mono mb-3">
                    This action cannot be undone.
                  </p>
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
                      disabled={deleting}
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

                {status !== 'COMPLETED' && !showDeleteConfirm && (
                  <button
                    type="button"
                    onClick={handleArchive}
                    disabled={submitting}
                    className="border-2 border-black bg-[#F5F5F0] px-3 py-3 hover:bg-black hover:text-white transition-colors"
                    title="Mark as Completed"
                  >
                    <Archive className="w-5 h-5" />
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
                  disabled={submitting || deleting || !name.trim()}
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
