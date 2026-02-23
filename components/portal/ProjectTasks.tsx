'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  CheckCircle2,
  Play,
  AlertCircle,
  Lock,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { Task, TaskStatus, TaskCategory, useTasks } from '@/hooks/useTasks';

const PALETTE = {
  pink: '#ff006e',
  purple: '#8338ec',
  blue: '#3a86ff',
  yellow: '#ffbe0b',
  green: '#22c55e',
  orange: '#fb5607',
};

const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; icon: typeof Clock }> = {
  TODO: { label: 'Not Started', color: 'text-white/40', icon: Clock },
  IN_PROGRESS: { label: 'In Progress', color: 'text-[#8338ec]', icon: Play },
  REVIEW: { label: 'In Review', color: 'text-[#ffbe0b]', icon: AlertCircle },
  DONE: { label: 'Completed', color: 'text-green-400', icon: CheckCircle2 },
  BLOCKED: { label: 'Blocked', color: 'text-red-400', icon: Lock },
};

const CATEGORY_LABELS: Record<TaskCategory, string> = {
  PRE_PRODUCTION: 'Prieš produkciją',
  SHOOTING: 'Filmavimas',
  EDITING: 'Montažas',
  MOTION_GRAPHICS: 'Motion Graphics',
  COLOR: 'Spalvų koregavimas',
  SOUND: 'Garso dizainas',
  VFX: 'VFX efektai',
  DELIVERY: 'Finalinis pristatymas',
  REVISION: 'Korekcijos',
  OTHER: 'Kita',
};

interface ProjectTasksProps {
  projectId: string;
}

function TaskRow({ task, isExpanded, onToggle }: { task: Task; isExpanded: boolean; onToggle: () => void }) {
  const config = STATUS_CONFIG[task.status];
  const Icon = config.icon;
  const progress = task.estimatedHours
    ? Math.min(100, Math.round((task.actualHours / task.estimatedHours) * 100))
    : 0;

  return (
    <div className="border-b border-white/5 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center gap-4 hover:bg-white/5 transition-colors"
      >
        <Icon className={`w-5 h-5 flex-shrink-0 ${config.color}`} />
        
        <div className="flex-1 text-left">
          <p className="text-sm text-white/90 font-medium">{task.name}</p>
          <p className="text-xs text-white/40">{CATEGORY_LABELS[task.category]}</p>
        </div>

        <div className="flex items-center gap-4">
          {task.estimatedHours && (
            <div className="hidden sm:flex items-center gap-2 w-32">
              <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#3a86ff] rounded-full transition-all"
                  style={{ width: `${Math.min(100, progress)}%` }}
                />
              </div>
              <span className="text-xs text-white/40 font-mono w-12 text-right">
                {progress}%
              </span>
            </div>
          )}

          <div className="text-xs font-mono text-white/30">
            {task.actualHours.toFixed(1)}h
            {task.estimatedHours && ` / ${task.estimatedHours}h`}
          </div>

          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-white/40" />
          ) : (
            <ChevronRight className="w-4 h-4 text-white/40" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pl-14">
              {task.description && (
                <p className="text-sm text-white/60 mb-3">{task.description}</p>
              )}

              <div className="flex items-center gap-6 text-xs font-mono">
                <div>
                  <span className="text-white/40">Status: </span>
                  <span className={config.color}>{STATUS_CONFIG[task.status].label}</span>
                </div>

                <div>
                  <span className="text-white/40">Category: </span>
                  <span className="text-white/70">{CATEGORY_LABELS[task.category]}</span>
                </div>

                {task.estimatedHours && (
                  <div>
                    <span className="text-white/40">Estimated: </span>
                    <span className="text-white/70">{task.estimatedHours}h</span>
                  </div>
                )}

                <div>
                  <span className="text-white/40">Actual: </span>
                  <span className="text-white/70">{task.actualHours.toFixed(1)}h</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ProjectTasks({ projectId }: ProjectTasksProps) {
  const { tasks, tasksByStatus, stats, loading, error } = useTasks({ projectId });
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  const toggleTask = (taskId: string) => {
    const newSet = new Set(expandedTasks);
    if (newSet.has(taskId)) {
      newSet.delete(taskId);
    } else {
      newSet.add(taskId);
    }
    setExpandedTasks(newSet);
  };

  if (loading) {
    return (
      <div className="bg-[#141414] border border-white/10 p-8">
        <div className="flex items-center justify-center gap-3">
          <div className="w-5 h-5 border-2 border-[#ff006e] border-t-transparent rounded-full animate-spin" />
          <span className="text-white/60">Loading tasks...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#141414] border border-red-500/30 p-6 text-red-400">
        {error}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="bg-[#141414] border border-white/10 p-8 text-center">
        <Clock className="w-12 h-12 text-white/20 mx-auto mb-4" />
        <p className="text-white/60">No work breakdown yet.</p>
        <p className="text-white/40 text-sm mt-2">Tasks will appear here when admin creates them.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Header */}
      <div className="bg-[#141414] border border-white/10 p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <p className="text-xs uppercase tracking-wider text-white/50 mb-2">Project Progress</p>
            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#ff006e] to-[#8338ec] transition-all"
                style={{ width: `${stats.progress}%` }}
              />
            </div>
          </div>

          <div className="text-right">
            <p className="text-2xl font-bold text-white">{stats.progress}%</p>
            <p className="text-xs text-white/40">{stats.completed}/{stats.total} tasks</p>
          </div>
        </div>

        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-white/5 text-xs font-mono">
          <div>
            <span className="text-white/40">Time spent: </span>
            <span className="text-[#3a86ff] font-bold">{stats.totalActual.toFixed(1)}h</span>
          </div>
          
          {stats.totalEstimated > 0 && (
            <div>
              <span className="text-white/40">Estimated: </span>
              <span className="text-white/70">{stats.totalEstimated}h</span>
            </div>
          )}

          <div>
            <span className="text-white/40">Remaining: </span>
            <span className="text-white/70">{Math.max(0, stats.totalEstimated - stats.totalActual).toFixed(1)}h</span>
          </div>
        </div>
      </div>

      {/* Status Groups */}
      <div className="space-y-2">
        {(['IN_PROGRESS', 'REVIEW', 'TODO', 'DONE', 'BLOCKED'] as TaskStatus[]).map((status) => {
          const tasksInStatus = tasksByStatus[status] || [];
          if (tasksInStatus.length === 0) return null;

          return (
            <div key={status} className="bg-[#141414] border border-white/10 overflow-hidden">
              <div className={`px-4 py-2 border-b border-white/5 ${STATUS_CONFIG[status].bg}`}>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold uppercase tracking-wider ${STATUS_CONFIG[status].color}`}>
                    {STATUS_CONFIG[status].label}
                  </span>
                  <span className="text-xs text-white/30">({tasksInStatus.length})</span>
                </div>
              </div>

              <div>
                {tasksInStatus.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    isExpanded={expandedTasks.has(task.id)}
                    onToggle={() => toggleTask(task.id)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
