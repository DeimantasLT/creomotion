'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Trash2, Archive, FolderKanban, ListTodo, Clock, ChevronRight } from 'lucide-react';
import type { Project } from '@/types';
import { TaskBoard } from './TaskBoard';
import { CreateTaskModal } from './CreateTaskModal';
import { useTasks } from '@/hooks/useTasks';

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

const PALETTE = {
  pink: '#ff006e',
  purple: '#8338ec',
  blue: '#3a86ff',
  yellow: '#ffbe0b',
};

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
  const [activeTab, setActiveTab] = useState<'details' | 'tasks'>('details');
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [taskRefreshTrigger, setTaskRefreshTrigger] = useState(0);
  
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
      setActiveTab('details');
      onClose();
    }
  };

  if (!project) return null;

  const clientName = clients.find(c => c.id === clientId)?.name || 'Unknown';

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

          <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-6xl max-h-[90vh] bg-[#141414] border border-white/10 overflow-hidden rounded-sm flex flex-col"
            >
              {/* Header */}
              <div className="border-b border-white/10 p-4 bg-[#0a0a0a] flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <h2 className="text-white font-bold text-lg">
                      {name || 'Edit Project'}
                    </h2>
                    <span className="text-white/30">|</span>
                    <span className="text-xs text-white/50 font-mono">{clientName}</span>
                  </div>
                  <button
                    onClick={handleClose}
                    disabled={submitting}
                    className="p-1 text-white/60 hover:text-[#ff006e] transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-1 mt-4 border-b border-white/5">
                  <button
                    onClick={() => setActiveTab('details')}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-mono uppercase tracking-wider transition-colors border-b-2 ${
                      activeTab === 'details'
                        ? 'text-white border-[#ff006e]'
                        : 'text-white/40 border-transparent hover:text-white/70'
                    }`}
                  >
                    <FolderKanban className="w-4 h-4" />
                    Details
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('tasks')}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-mono uppercase tracking-wider transition-colors border-b-2 ${
                      activeTab === 'tasks'
                        ? 'text-white border-[#ff006e]'
                        : 'text-white/40 border-transparent hover:text-white/70'
                    }`}
                  >
                    <ListTodo className="w-4 h-4" />
                    Tasks
                    <span className="ml-1 text-xs bg-white/10 px-1.5 py-0.5 rounded text-white/60">
                      {project._count?.tasks || 0}
                    </span>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-hidden">
                <AnimatePresence mode="wait">
                  {/* DETAILS TAB */}
                  {activeTab === 'details' && (
                    <motion.div
                      key="details"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="h-full overflow-y-auto p-6"
                    >
                      <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">
                        {/* Project Name */}
                        <div>
                          <label className="block font-mono text-xs text-white/60 uppercase tracking-wider mb-2">
                            Project Name *
                          </label>
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter project name"
                            required
                            disabled={submitting}
                            className="w-full border border-white/10 bg-[#1a1a1a] px-4 py-3 text-sm font-mono text-white outline-none focus:border-[#ff006e] transition-all disabled:opacity-50 placeholder:text-white/30"
                          />
                        </div>

                        {/* Client */}
                        <div>
                          <label className="block font-mono text-xs text-white/60 uppercase tracking-wider mb-2">
                            Client *
                          </label>
                          <select
                            value={clientId}
                            onChange={(e) => setClientId(e.target.value)}
                            required
                            disabled={submitting}
                            className="w-full border border-white/10 bg-[#1a1a1a] px-4 py-3 text-sm font-mono text-white outline-none focus:border-[#ff006e] transition-all appearance-none disabled:opacity-50"
                          >
                            <option value="" className="bg-[#1a1a1a]">Select a client</option>
                            {clients.map((c) => (
                              <option key={c.id} value={c.id} className="bg-[#1a1a1a]">
                                {c.name} {c.company ? `— ${c.company}` : ''}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Status */}
                        <div>
                          <label className="block font-mono text-xs text-white/60 uppercase tracking-wider mb-2">
                            Status
                          </label>
                          <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            disabled={submitting}
                            className="w-full border border-white/10 bg-[#1a1a1a] px-4 py-3 text-sm font-mono text-white outline-none focus:border-[#ff006e] transition-all appearance-none disabled:opacity-50"
                          >
                            {PROJECT_STATUSES.map((s) => (
                              <option key={s.value} value={s.value} className="bg-[#1a1a1a]">{s.label}</option>
                            ))}
                          </select>
                        </div>

                        {/* Description */}
                        <div>
                          <label className="block font-mono text-xs text-white/60 uppercase tracking-wider mb-2">
                            Description
                          </label>
                          <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Project description..."
                            rows={3}
                            disabled={submitting}
                            className="w-full border border-white/10 bg-[#1a1a1a] px-4 py-3 text-sm font-mono text-white outline-none focus:border-[#ff006e] transition-all resize-none disabled:opacity-50 placeholder:text-white/30"
                          />
                        </div>

                        {/* Budget & Deadline */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block font-mono text-xs text-white/60 uppercase tracking-wider mb-2">
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
                              className="w-full border border-white/10 bg-[#1a1a1a] px-4 py-3 text-sm font-mono text-white outline-none focus:border-[#ff006e] transition-all disabled:opacity-50 placeholder:text-white/30"
                            />
                          </div>

                          <div>
                            <label className="block font-mono text-xs text-white/60 uppercase tracking-wider mb-2">
                              Deadline
                            </label>
                            <input
                              type="date"
                              value={deadline}
                              onChange={(e) => setDeadline(e.target.value)}
                              disabled={submitting}
                              className="w-full border border-white/10 bg-[#1a1a1a] px-4 py-3 text-sm font-mono text-white outline-none focus:border-[#ff006e] transition-all disabled:opacity-50"
                            />
                          </div>
                        </div>

                        {/* Error */}
                        {error && (
                          <div className="p-3 border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-mono">
                            [ERROR: {error}]
                          </div>
                        )}

                        {/* Delete Confirm */}
                        {showDeleteConfirm && onDelete && (
                          <div className="p-4 border border-red-500/30 bg-red-500/10">
                            <p className="text-sm font-mono text-white mb-2">DELETE THIS PROJECT?</p>
                            <p className="text-xs text-red-400 mb-3">This action cannot be undone.</p>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 px-3 py-2 bg-[#1a1a1a] border border-white/10 text-xs text-white hover:bg-white/10"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={handleDelete}
                                disabled={deleting}
                                className="flex-1 px-3 py-2 bg-red-500 text-white text-xs hover:bg-red-600 disabled:opacity-50"
                              >
                                {deleting ? 'DELETING...' : 'YES, DELETE'}
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 pt-4">
                          {onDelete && !showDeleteConfirm && (
                            <button
                              type="button"
                              onClick={() => setShowDeleteConfirm(true)}
                              className="px-3 py-2 border border-white/10 text-red-400 hover:bg-red-500/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}

                          {status !== 'COMPLETED' && !showDeleteConfirm && (
                            <button
                              type="button"
                              onClick={handleArchive}
                              disabled={submitting}
                              className="px-3 py-2 border border-white/10 text-white/60 hover:bg-white/10"
                              title="Mark as Completed"
                            >
                              <Archive className="w-4 h-4" />
                            </button>
                          )}

                          <div className="flex-1" />

                          <button
                            type="button"
                            onClick={handleClose}
                            disabled={submitting}
                            className="px-4 py-2 border border-white/10 text-white/60 text-sm hover:text-white"
                          >
                            Cancel
                          </button>
                          
                          <button
                            type="submit"
                            disabled={submitting || !name.trim()}
                            className="px-4 py-2 bg-[#ff006e] text-white text-sm font-bold hover:bg-[#ff006e]/80 disabled:opacity-50 flex items-center gap-2"
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
                  )}

                  {/* TASKS TAB */}
                  {activeTab === 'tasks' && (
                    <motion.div
                      key="tasks"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="h-full overflow-y-auto p-6"
                    >
                      <TaskBoard
                        projectId={project.id}
                        onTaskCreated={() => setTaskRefreshTrigger(p => p + 1)}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

          {/* Create Task Modal */}
          <CreateTaskModal
            isOpen={showCreateTask}
            onClose={() => setShowCreateTask(false)}
            projectId={project.id}
            onSuccess={() => {
              setShowCreateTask(false);
              setTaskRefreshTrigger(p => p + 1);
            }}
          />
        </>
      )}
    </AnimatePresence>
  );
}
