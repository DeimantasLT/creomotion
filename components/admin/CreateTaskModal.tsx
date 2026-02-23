'use client';

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { X, Clock, Plus, ChevronDown } from 'lucide-react';
import { TaskCategory } from '@/hooks/useTasks';
import { motion } from 'framer-motion';

const PALETTE = {
  pink: '#ff006e',
  purple: '#8338ec',
  blue: '#3a86ff',
  yellow: '#ffbe0b',
};

const CATEGORIES: { value: TaskCategory; label: string; short: string }[] = [
  { value: 'PRE_PRODUCTION', label: 'Prieš produkciją', short: 'Pre-pro' },
  { value: 'SHOOTING', label: 'Filmavimas', short: 'Filmavimas' },
  { value: 'EDITING', label: 'Montažas', short: 'Montažas' },
  { value: 'MOTION_GRAPHICS', label: 'Motion Graphics', short: 'Motion' },
  { value: 'COLOR', label: 'Spalvų koregavimas', short: 'Spalvos' },
  { value: 'SOUND', label: 'Garso dizainas', short: 'Garsas' },
  { value: 'VFX', label: 'VFX efektai', short: 'VFX' },
  { value: 'DELIVERY', label: 'Finalinis pristatymas', short: 'Pristatymas' },
  { value: 'REVISION', label: 'Korekcijos', short: 'Korekcijos' },
  { value: 'OTHER', label: 'Kita', short: 'Kita' },
];

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onSuccess: () => void;
}

export function CreateTaskModal({ isOpen, onClose, projectId, onSuccess }: CreateTaskModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('EDITING');
  const [estimatedHours, setEstimatedHours] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCategorySelect, setShowCategorySelect] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !projectId) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          category,
          estimatedHours: estimatedHours ? parseFloat(estimatedHours) : null,
        }),
      });

      if (!response.ok) throw new Error('Failed to create task');

      resetForm();
      onSuccess();
    } catch (err) {
      console.error('Failed to create task:', err);
      alert('Failed to create task');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setCategory('EDITING');
    setEstimatedHours('');
  };

  const handleClose = () => {
    if (!isLoading) {
      resetForm();
      onClose();
    }
  };

  const selectedCategory = CATEGORIES.find((c) => c.value === category);

  if (!isOpen) return null;

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
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-[#141414] border border-white/10 overflow-hidden"
            >
              {/* Header */}
              <div className="border-b border-white/10 p-4 bg-[#0a0a0a]">
                <div className="flex items-center justify-between">
                  <h2 className="text-white font-bold text-sm flex items-center gap-2">
                    <Plus className="w-4 h-4" style={{ color: PALETTE.pink }} />
                    New Task
                  </h2>
                  <button
                    onClick={handleClose}
                    disabled={isLoading}
                    className="p-1 text-white/60 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                {/* Task Name */}
                <div>
                  <label className="block text-[10px] font-mono uppercase text-white/50 mb-1">
                    Task Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Vinjeta Intro"
                    className="w-full bg-[#0a0a0a] border border-white/10 px-3 py-2 text-white text-sm outline-none focus:border-[#ff006e]"
                    autoFocus
                  />
                </div>

                {/* Category */}
                <div className="relative">
                  <label className="block text-[10px] font-mono uppercase text-white/50 mb-1">
                    Category
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowCategorySelect(!showCategorySelect)}
                    className="w-full bg-[#0a0a0a] border border-white/10 px-3 py-2 text-white text-sm flex items-center justify-between hover:border-white/20"
                  >
                    <span>{selectedCategory?.label || 'Select...'}</span>
                    <ChevronDown className="w-4 h-4 text-white/40" />
                  </button>

                  {showCategorySelect && (
                    <div className="absolute z-10 left-0 right-0 mt-1 bg-[#0a0a0a] border border-white/10 max-h-48 overflow-y-auto">
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat.value}
                          type="button"
                          onClick={() => {
                            setCategory(cat.value);
                            setShowCategorySelect(false);
                          }}
                          className={`w-full px-3 py-2 text-left text-sm hover:bg-white/5 ${
                            category === cat.value ? 'bg-white/10 text-white' : 'text-white/70'
                          }`}
                        >
                          <span className="font-medium">{cat.label}</span>
                          <span className="text-white/40 ml-2 text-xs">({cat.short})</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[10px] font-mono uppercase text-white/50 mb-1">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Task details..."
                    rows={3}
                    className="w-full bg-[#0a0a0a] border border-white/10 px-3 py-2 text-white text-sm outline-none focus:border-[#ff006e] resize-none"
                  />
                </div>

                {/* Estimated Hours */}
                <div>
                  <label className="block text-[10px] font-mono uppercase text-white/50 mb-1">
                    Estimated Hours
                  </label>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-white/40" />
                    <input
                      type="number"
                      value={estimatedHours}
                      onChange={(e) => setEstimatedHours(e.target.value)}
                      placeholder="e.g., 4"
                      min="0"
                      step="0.5"
                      className="flex-1 bg-[#0a0a0a] border border-white/10 px-3 py-2 text-white text-sm outline-none focus:border-[#ff006e]"
                    />
                    <span className="text-xs text-white/40">hours</span>
                  </div>
                </div>
              </form>

              {/* Footer */}
              <div className="border-t border-white/10 p-4 bg-[#0a0a0a]">
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isLoading}
                    className="px-4 py-2 text-white/60 text-sm hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isLoading || !name.trim()}
                    className="px-4 py-2 bg-[#ff006e] text-white text-sm font-bold hover:bg-[#ff006e]/80 disabled:opacity-50"
                  >
                    {isLoading ? 'Creating...' : 'Create Task'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
