'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  MoreHorizontal,
  Edit3,
  Trash2,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { Task, TaskStatus, TaskCategory, useTasks } from '@/hooks/useTasks';
import { CreateTaskModal } from './CreateTaskModal';

const PALETTE = {
  pink: '#ff006e',
  purple: '#8338ec',
  blue: '#3a86ff',
  yellow: '#ffbe0b',
  green: '#22c55e',
  orange: '#fb5607',
  red: '#ef4444',
};

const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; bg: string; border: string }> = {
  TODO: { label: 'TODO', color: 'text-white/60', bg: 'bg-white/5', border: 'border-white/10' },
  IN_PROGRESS: { label: 'In Progress', color: 'text-[#8338ec]', bg: 'bg-[#8338ec]/10', border: 'border-[#8338ec]/30' },
  REVIEW: { label: 'Review', color: 'text-[#ffbe0b]', bg: 'bg-[#ffbe0b]/10', border: 'border-[#ffbe0b]/30' },
  DONE: { label: 'Done', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' },
  BLOCKED: { label: 'Blocked', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
};

const CATEGORY_COLORS: Record<TaskCategory, string> = {
  PRE_PRODUCTION: PALETTE.purple,
  SHOOTING: PALETTE.pink,
  EDITING: PALETTE.blue,
  MOTION_GRAPHICS: PALETTE.yellow,
  COLOR: '#a855f7',
  SOUND: '#06b6d4',
  VFX: PALETTE.orange,
  DELIVERY: PALETTE.green,
  REVISION: '#64748b',
  OTHER: '#475569',
};

const CATEGORY_LABELS: Record<TaskCategory, string> = {
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

interface TaskBoardProps {
  projectId: string;
  onTaskCreated?: () => void;
  readOnly?: boolean;
}

function TaskCard({
  task,
  onEdit,
  onDelete,
  onStatusChange,
  readOnly,
}: {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  onStatusChange?: (taskId: string, status: TaskStatus) => void;
  readOnly?: boolean;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const categoryColor = CATEGORY_COLORS[task.category] || CATEGORY_COLORS.OTHER;

  const progress = task.estimatedHours
    ? Math.min(100, Math.round((task.actualHours / task.estimatedHours) * 100))
    : 0;
  const isOverTime = task.estimatedHours && task.actualHours > task.estimatedHours;

  return (
    <div className="group bg-[#1a1a1a] border border-white/10 p-3 hover:border-white/20 transition-colors">
      {/* Category & Time */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: categoryColor }} />
          <span className="text-[10px] uppercase font-mono text-white/40">
            {CATEGORY_LABELS[task.category]}
          </span>
        </div>
        <span className={`text-[10px] font-mono ${isOverTime ? 'text-red-400' : 'text-white/30'}`}>
          {task.actualHours.toFixed(1)}h
          {task.estimatedHours && ` / ${task.estimatedHours}h`}
        </span>
      </div>

      {/* Name */}
      <h4 className="text-sm font-medium text-white/90 mb-1">{task.name}</h4>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-white/40 line-clamp-2 mb-2">{task.description}</p>
      )}

      {/* Progress Bar */}
      {task.estimatedHours && (
        <div className="mb-2">
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${isOverTime ? 'bg-red-500' : 'bg-[#3a86ff]'}`}
              style={{ width: `${Math.min(100, progress)}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      {!readOnly && (
        <div className="flex items-center justify-between">
          <select
            value={task.status}
            onChange={(e) => onStatusChange?.(task.id, e.target.value as TaskStatus)}
            className={`text-[10px] font-mono uppercase bg-transparent border border-white/10 rounded px-2 py-1 ${STATUS_CONFIG[task.status].color}`}
          >
            {<>
              <option value="TODO">TODO</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="REVIEW">Review</option>
              <option value="DONE">Done</option>
              <option value="BLOCKED">Blocked</option>
            </>}
          </select>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 text-white/20 hover:text-white/60"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 bottom-full mb-1 bg-[#141414] border border-white/10 rounded z-20 min-w-[120px]"
                >
                  <button
                    onClick={() => {
                      onEdit?.(task);
                      setShowMenu(false);
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-xs text-white/70 hover:bg-white/5"
                  >
                    <Edit3 className="w-3 h-3" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      onDelete?.(task.id);
                      setShowMenu(false);
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}

const scrollbarHideStyles: React.CSSProperties = {
  scrollbarWidth: 'none',
  msOverflowStyle: 'none',
};

function TaskColumn({
  status,
  tasks,
  onEdit,
  onDelete,
  onStatusChange,
  readOnly,
}: {
  status: TaskStatus;
  tasks: Task[];
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  onStatusChange?: (taskId: string, status: TaskStatus) => void;
  readOnly?: boolean;
}) {
  const config = STATUS_CONFIG[status];
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-[#0a0a0a] border border-white/5 flex flex-col max-h-[400px] min-h-[300px]">
      <div className={`${config.bg} border-b ${config.border} p-3 flex-shrink-0`}>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsExpanded(!isExpanded)} className="text-white/40">
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          <span className={`text-xs font-bold font-mono uppercase ${config.color}`}>
            {config.label}
          </span>
          <span className="text-xs text-white/30 font-mono">({tasks.length})</span>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && tasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 overflow-y-auto p-2 space-y-2"
            style={scrollbarHideStyles}
          >
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={onEdit}
                onDelete={onDelete}
                onStatusChange={onStatusChange}
                readOnly={readOnly}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function TaskBoard({ projectId, onTaskCreated, readOnly }: TaskBoardProps) {
  const {
    tasks,
    tasksByStatus,
    stats,
    loading,
    error,
    refetch,
    createTask,
    updateTask,
    deleteTask,
  } = useTasks({ projectId });

  const [showCreate, setShowCreate] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const handleCreate = async (data: any) => {
    await createTask(data);
    setShowCreate(false);
    onTaskCreated?.();
    await refetch();
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    await updateTask(taskId, { status: newStatus });
    await refetch();
  };

  const handleDelete = async (taskId: string) => {
    if (confirm('Delete this task?')) {
      await deleteTask(taskId);
      await refetch();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-[#ff006e] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-400 text-sm p-4 border border-red-500/30 bg-red-500/10">{error}</div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      {!readOnly && (
        <div className="bg-[#141414] border border-white/10 p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#ff006e] to-[#8338ec] transition-all"
                  style={{ width: `${stats.progress}%` }}
                />
              </div>
            </div>
            <span className="text-sm font-mono text-white/60">{stats.progress}%</span>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="text-green-400">{stats.completed}/{stats.total}</span>
              <span className="text-white/30">|</span>
              <span className="text-[#3a86ff]">{stats.totalActual.toFixed(1)}h</span>
            </div>
            {!readOnly && (
              <button
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-1 px-3 py-1.5 bg-[#ff006e] text-white text-xs font-bold hover:bg-[#ff006e]/80"
              >
                <Plus className="w-3 h-3" />
                Add Task
              </button>
            )}
          </div>
        </div>
      )}

      {/* Kanban */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-2">
        {(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE', 'BLOCKED'] as TaskStatus[]).map((status) => (
          <TaskColumn
            key={status}
            status={status}
            tasks={tasksByStatus[status] || []}
            onEdit={setEditingTask}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
            readOnly={readOnly}
          />
        ))}
      </div>

      {/* Empty State */}
      {tasks.length === 0 && !readOnly && (
        <div className="text-center py-12 border border-white/10 bg-[#141414]">
          <Clock className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/60 mb-2">No tasks yet</p>
          <p className="text-white/40 text-sm mb-4">Add tasks to track project progress</p>
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 bg-[#ff006e] text-white text-sm font-bold"
          >
            Create First Task
          </button>
        </div>
      )}

      {/* Create Modal */}
      {!readOnly && (
        <CreateTaskModal
          isOpen={showCreate}
          onClose={() => setShowCreate(false)}
          projectId={projectId}
          onSuccess={async () => {
            setShowCreate(false);
            await refetch();
            onTaskCreated?.();
          }}
        />
      )}
    </div>
  );
}
