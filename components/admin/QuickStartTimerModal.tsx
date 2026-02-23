'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X, Clock, ChevronDown, Folder, Briefcase, FileText } from 'lucide-react';
import type { Project } from '@/types';
import { useTasks } from '@/hooks/useTasks';
import { useGlobalTimer } from '@/hooks/useGlobalTimer';

interface ProjectWithClient extends Project {
  client?: {
    id: string;
    name: string;
  };
}

interface QuickStartTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  PRE_PRODUCTION: 'Pre-pro',
  SHOOTING: 'Filmavimas',
  EDITING: 'Montažas',
  MOTION_GRAPHICS: 'Motion',
  COLOR: 'Spalvos',
  SOUND: 'Garsas',
  VFX: 'VFX',
  DELIVERY: 'Pristatymas',
  REVISION: 'Korekcijos',
  OTHER: 'Kita',
};

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'text-white/40',
  IN_PROGRESS: 'text-[#8338ec]',
  REVIEW: 'text-[#ffbe0b]',
  APPROVED: 'text-[#3a86ff]',
  COMPLETED: 'text-green-400',
};

export function QuickStartTimerModal({ isOpen, onClose }: QuickStartTimerModalProps) {
  const { startTimer } = useGlobalTimer();
  
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [notes, setNotes] = useState('');
  const [projects, setProjects] = useState<ProjectWithClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProjectSelect, setShowProjectSelect] = useState(false);

  // Load tasks for selected project
  const { tasks, tasksByStatus, loading: tasksLoading } = useTasks({
    projectId: selectedProject,
  });

  // Get active tasks
  const activeTasks = [
    ...(tasksByStatus.IN_PROGRESS || []),
    ...(tasksByStatus.TODO || []),
    ...(tasksByStatus.REVIEW || []),
  ];

  // Fetch projects
  useEffect(() => {
    if (isOpen) {
      const fetchProjects = async () => {
        setLoading(true);
        try {
          const res = await fetch('/api/projects?status=IN_PROGRESS');
          if (res.ok) {
            const data = await res.json();
            setProjects(data.projects || []);
          }
        } catch (err) {
          console.error('Failed to load projects:', err);
        } finally {
          setLoading(false);
        }
      };

      fetchProjects();
      // Reset state when opening
      setSelectedProject('');
      setSelectedTaskId('');
      setNotes('');
      setShowProjectSelect(false);
    }
  }, [isOpen]);

  // Reset task when project changes
  useEffect(() => {
    setSelectedTaskId('');
  }, [selectedProject]);

  const handleStart = () => {
    if (!selectedProject) return;

    const project = projects.find((p) => p.id === selectedProject);
    const task = tasks.find((t) => t.id === selectedTaskId);

    startTimer({
      projectId: selectedProject,
      projectName: project?.name || 'Unknown',
      taskId: selectedTaskId || undefined,
      taskName: task?.name || undefined,
      taskCategory: task?.category || undefined,
      notes: notes || undefined,
    });

    onClose();
  };

  const selectedProjectData = projects.find((p) => p.id === selectedProject);
  const selectedTaskData = tasks.find((t) => t.id === selectedTaskId);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-[#141414] border border-white/10 overflow-hidden rounded-sm"
            >
              {/* Header */}
              <div className="border-b border-white/10 p-4 bg-[#0a0a0a]">
                <div className="flex items-center justify-between">
                  <h2 className="text-white font-bold text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4" style={{ color: '#ff006e' }} />
                    Pradėti skaičiuoti laiką
                  </h2>
                  <button
                    onClick={onClose}
                    disabled={loading}
                    className="p-1 text-white/60 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-4">
                {/* Project Selector */}
                <div className="relative">
                  <label className="block text-[10px] font-mono uppercase text-white/50 mb-1">
                    Projektas *
                  </label>
                  
                  {selectedProject ? (
                    <div 
                      onClick={() => setShowProjectSelect(!showProjectSelect)}
                      className="w-full bg-[#0a0a0a] border border-[#ff006e]/30 px-3 py-3 text-white cursor-pointer hover:border-[#ff006e] transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Folder className="w-4 h-4 text-[#8338ec]" />
                          <span className="font-medium">{selectedProjectData?.name}</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-white/40 transition-transform ${showProjectSelect ? 'rotate-180' : ''}`} />
                      </div>
                      {selectedProjectData?.client?.name && (
                        <p className="text-xs text-white/40 mt-1 ml-6">
                          Klientas: {selectedProjectData.client.name}
                        </p>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowProjectSelect(true)}
                      className="w-full bg-[#0a0a0a] border border-white/10 px-3 py-3 text-white/50 hover:text-white hover:border-white/30 transition-colors flex items-center justify-between"
                    >
                      <span>Pasirinkti projektą...</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  )}

                  {/* Project Dropdown */}
                  <AnimatePresence>
                    {showProjectSelect && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-20 left-0 right-0 mt-1 bg-[#0a0a0a] border border-white/10 max-h-64 overflow-y-auto"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                      >
                        {loading ? (
                          <div className="p-4 text-center text-white/40 text-sm">
                            Kraunama...
                          </div>
                        ) : projects.length === 0 ? (
                          <div className="p-4 text-center text-white/40 text-sm">
                            Nėra aktyvių projektų
                          </div>
                        ) : (
                          projects.map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => {
                                setSelectedProject(p.id);
                                setShowProjectSelect(false);
                              }}
                              className={`w-full px-3 py-3 text-left hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 ${
                                selectedProject === p.id ? 'bg-white/10' : ''
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <Folder className="w-4 h-4 text-[#8338ec]" />
                                <span className="font-medium text-white">{p.name}</span>
                              </div>
                              <div className="flex items-center gap-2 mt-1 ml-6">
                                <span className={`text-[10px] uppercase font-mono ${STATUS_COLORS[p.status] || 'text-white/40'}`}>
                                  {p.status}
                                </span>
                                {p.client?.name && (
                                  <span className="text-[10px] text-white/40">
                                    • {p.client.name}
                                  </span>
                                )}
                              </div>
                            </button>
                          ))
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Task Selector */}
                {selectedProject && !tasksLoading && activeTasks.length > 0 && (
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-white/50 mb-1">
                      Task (neprivaloma)
                    </label>
                    <select
                      value={selectedTaskId}
                      onChange={(e) => setSelectedTaskId(e.target.value)}
                      className="w-full bg-[#0a0a0a] border border-white/10 px-3 py-3 text-white text-sm outline-none focus:border-[#ff006e]"
                    >
                      <option value="">Be konkretaus task...</option>
                      {activeTasks.map((task) => (
                        <option key={task.id} value={task.id}>
                          [{CATEGORY_LABELS[task.category] || task.category}] {task.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {selectedProject && tasksLoading && (
                  <div className="flex items-center gap-2 text-white/40 text-xs py-2">
                    <div className="w-3 h-3 border border-white/20 border-t-[#ff006e] rounded-full animate-spin" />
                    Kraunami task...
                  </div>
                )}

                {selectedProject && !tasksLoading && activeTasks.length === 0 && (
                  <div className="flex items-start gap-2 text-white/40 text-xs py-2">
                    <FileText className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>Šiame projekte nėra aktyvių task. Galite trackinti be konkretaus task.</span>
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className="block text-[10px] font-mono uppercase text-white/50 mb-1">
                    Note (neprivaloma)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ką dirbi šiuo metu?"
                    className="w-full bg-[#0a0a0a] border border-white/10 px-3 py-2 text-white text-sm outline-none focus:border-[#ff006e] resize-none"
                    rows={2}
                  />
                </div>

                {/* Summary */}
                {selectedProject && (
                  <div className="bg-[#0a0a0a] border border-white/10 p-3 space-y-1">
                    <p className="text-[10px] uppercase text-white/40 font-mono">Bus trackinama:</p>
                    <p className="text-sm text-white flex items-center gap-2">
                      <Folder className="w-3 h-3 text-[#8338ec]" />
                      {selectedProjectData?.name}
                    </p>
                    {selectedTaskData && (
                      <p className="text-sm text-[#3a86ff] flex items-center gap-2">
                        <Briefcase className="w-3 h-3" />
                        [{CATEGORY_LABELS[selectedTaskData.category] || selectedTaskData.category}] {selectedTaskData.name}
                      </p>
                    )}
                    {notes && (
                      <p className="text-xs text-white/60 italic">"{notes}"</p>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-white/10 p-4 bg-[#0a0a0a]">
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="px-4 py-2 text-white/60 text-sm hover:text-white"
                  >
                    Atšaukti
                  </button>
                  <button
                    onClick={handleStart}
                    disabled={!selectedProject}
                    className="px-6 py-2 bg-[#ff006e] text-white text-sm font-bold hover:bg-[#ff006e]/80 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Play className="w-4 h-4" fill="currentColor" />
                    {selectedTaskId ? 'Pradėti task' : 'Pradėti be task'}
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
