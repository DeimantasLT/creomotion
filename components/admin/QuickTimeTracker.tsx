'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Clock, AlertCircle, Check, Folder, Timer } from 'lucide-react';
import type { Project } from '@/types';
import { useTasks } from '@/hooks/useTasks';
import { useGlobalTimer } from '@/hooks/useGlobalTimer';

interface ProjectWithClient extends Project {
  client?: {
    id: string;
    name: string;
  };
}

interface TimeEntry {
  id: string;
  projectId: string;
  project?: {
    id: string;
    name: string;
    client?: {
      id: string;
      name: string;
    };
  };
  taskId?: string;
  task?: {
    id: string;
    name: string;
    category: string;
  };
  description?: string;
  taskType?: string;
  duration: number;
  date: string;
  billable: boolean;
}

interface QuickTimeTrackerProps {
  refreshTrigger?: number;
  onEntryCreated?: () => void;
}

const formatDurationShort = (seconds: number): string => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hrs === 0) return `${mins}m`;
  if (mins === 0) return `${hrs}h`;
  return `${hrs}h ${mins}m`;
};

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

export default function QuickTimeTracker({ refreshTrigger = 0, onEntryCreated }: QuickTimeTrackerProps) {
  const { isRunning, startTimer, formatTime, elapsed, projectName, taskName } = useGlobalTimer();
  
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [notes, setNotes] = useState('');
  const [projects, setProjects] = useState<ProjectWithClient[]>([]);
  const [recentEntries, setRecentEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load tasks for selected project
  const { tasks, tasksByStatus, loading: tasksLoading } = useTasks({
    projectId: selectedProject,
  });

  // Get active tasks (TODO + IN_PROGRESS)
  const activeTasks = [
    ...(tasksByStatus.IN_PROGRESS || []),
    ...(tasksByStatus.TODO || []),
    ...(tasksByStatus.REVIEW || []),
  ];

  // Fetch projects and recent entries
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [projectsRes, entriesRes] = await Promise.all([
          fetch('/api/projects'),
          fetch('/api/time-entries?limit=5'),
        ]);

        if (projectsRes.ok) {
          const data = await projectsRes.json();
          setProjects(data.projects?.filter((p: ProjectWithClient) => p.status === 'IN_PROGRESS') || []);
        }

        if (entriesRes.ok) {
          const data = await entriesRes.json();
          setRecentEntries(data.timeEntries?.slice(0, 5) || []);
        }
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [refreshTrigger]);

  // Reset task when project changes
  useEffect(() => {
    setSelectedTaskId('');
  }, [selectedProject]);

  const handleStart = () => {
    if (!selectedProject) return;
    
    const project = projects.find(p => p.id === selectedProject);
    const task = tasks.find(t => t.id === selectedTaskId);
    
    startTimer({
      projectId: selectedProject,
      projectName: project?.name || 'Unknown',
      taskId: selectedTaskId || undefined,
      taskName: task?.name || undefined,
      taskCategory: task?.category || undefined,
      notes: notes || undefined,
    });
    
    // Reset form
    setNotes('');
    setSelectedTaskId('');
    setError(null);
  };

  const selectedProjectData = projects.find((p) => p.id === selectedProject);
  const selectedTaskData = tasks.find((t) => t.id === selectedTaskId);

  if (loading) {
    return (
      <div className="bg-[#141414] border border-white/10 rounded-sm p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-white/10 rounded w-1/3" />
          <div className="h-10 bg-white/10 rounded" />
          <div className="h-10 bg-white/10 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#141414] border border-white/10 rounded-sm p-6">
      <h3 className="text-sm font-[var(--font-jetbrains-mono)] text-white/40 tracking-widest mb-4">
        QUICK TRACK
      </h3>
      
      {isRunning ? (
        // Timer is running - show status
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-[#ff006e]/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Timer className="w-8 h-8 text-[#ff006e] animate-pulse" />
          </div>
          
          <p className="text-2xl font-[var(--font-jetbrains-mono)] text-white mb-2">
            {formatTime(elapsed)}
          </p>
          
          <div className="space-y-1 mb-4">
            <p className="text-white/60 text-sm">{projectName}</p>
            {taskName && (
              <p className="text-[#3a86ff] text-sm">
                {taskName}
              </p>
            )}
          </div>
          
          <div className="flex items-center justify-center gap-2 text-[10px] text-white/40 uppercase font-mono">
            <span className="w-2 h-2 bg-[#ff006e] rounded-full animate-pulse" />
            Laikas skaičiuojamas
          </div>
          
          <p className="text-[10px] text-white/30 mt-4">
            Floating widget pasiekiamas visur ekrano apačioje
          </p>
        </div>
      ) : (
        // Start form
        <div className="space-y-4">
          {/* Project Selector */}
          <div>
            <label className="text-[10px] font-mono uppercase text-white/40 mb-1 block">
              Project *
            </label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-sm px-3 py-2 text-white text-sm font-[var(--font-space-grotesk)] focus:border-[#ff006e] outline-none"
            >
              <option value="">Pasirinkti projektą...</option>
              {projects?.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          
          {/* Task Selector */}
          {selectedProject && !tasksLoading && (
            <div>
              <label className="text-[10px] font-mono uppercase text-white/40 mb-1 block">
                Task (neprivaloma)
              </label>
              <select
                value={selectedTaskId}
                onChange={(e) => setSelectedTaskId(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-sm px-3 py-2 text-white text-sm font-[var(--font-space-grotesk)] focus:border-[#ff006e] outline-none"
              >
                <option value="">Be konkretaus task...</option>
                {activeTasks.map((task) => (
                  <option key={task.id} value={task.id}>
                    {CATEGORY_LABELS[task.category] || task.category} — {task.name}
                  </option>
                ))}
              </select>
              
              {activeTasks.length === 0 && (
                <p className="text-[10px] text-white/30 mt-1">
                  Nėra aktyvių task. Pridėkite projekto detalėse.
                </p>
              )}
            </div>
          )}
          
          {selectedProject && tasksLoading && (
            <div className="flex items-center gap-2 text-white/40 text-xs py-2">
              <div className="w-3 h-3 border border-white/20 border-t-[#ff006e] rounded-full animate-spin" />
              Kraunami task...
            </div>
          )}
          
          {/* Notes */}
          <div>
            <label className="text-[10px] font-mono uppercase text-white/40 mb-1 block">
              Note (neprivaloma)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ką dirbi?"
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-sm px-3 py-2 text-white text-sm font-[var(--font-space-grotesk)] focus:border-[#ff006e] outline-none resize-none"
              rows={2}
            />
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleStart}
            disabled={!selectedProject}
            className="w-full py-3 bg-[#ff006e] text-[#0a0a0a] font-[var(--font-jetbrains-mono)] text-xs tracking-widest rounded-sm hover:bg-[#ff006e]/80 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4" fill="currentColor" />
            PRADĖTI SKAIČIUOTI
          </motion.button>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-3 border border-white/10 bg-red-500/20 text-white rounded-sm">
          <p className="text-xs flex items-center gap-2 font-[var(--font-jetbrains-mono)]">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="break-words">{error}</span>
          </p>
        </div>
      )}

      {/* Recent Entries */}
      {recentEntries.length > 0 && (
        <div className="mt-6 pt-4 border-t border-white/10">
          <h4 className="text-xs font-[var(--font-jetbrains-mono)] text-white/30 tracking-widest mb-3">
            NAUJAUSI ĮRAŠAI
          </h4>
          <div className="space-y-2">
            {recentEntries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between text-xs py-2 border-b border-white/5 last:border-0"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-white font-[var(--font-space-grotesk)] truncate">
                    {entry.project?.name || 'Unknown'}
                  </p>
                  <div className="flex items-center gap-1 text-white/40 font-[var(--font-jetbrains-mono)] truncate">
                    {entry.task && (
                      <>
                        <Check className="w-3 h-3 text-[#3a86ff]" />
                        <span className="text-[#3a86ff]">[{CATEGORY_LABELS[entry.task.category] || entry.task.category}]</span>
                      </>
                    )}
                    <span>{entry.description || 'Be aprašymo'}</span>
                  </div>
                </div>
                <span className="text-white/60 font-[var(--font-jetbrains-mono)] ml-2 whitespace-nowrap">
                  {formatDurationShort(entry.duration)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
