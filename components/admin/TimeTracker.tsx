'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Square, Clock, AlertCircle, Check, Pencil, Trash2, X, Loader2 } from 'lucide-react';
import type { Project, TimeEntry } from '@/types';

interface ProjectWithClient extends Project {
  client?: {
    id: string;
    name: string;
  };
}

interface ApiTimeEntry extends TimeEntry {
  user?: {
    id: string;
    name: string;
    email: string;
  };
  project?: {
    id: string;
    name: string;
    client?: {
      id: string;
      name: string;
    };
  };
}

interface TimeTrackerProps {
  refreshTrigger?: number;
  onEntryCreated?: () => void;
}

type TimerState = 'idle' | 'running' | 'paused';

const formatDuration = (seconds: number): string => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const formatDurationShort = (seconds: number): string => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hrs === 0) return `${mins}m`;
  if (mins === 0) return `${hrs}h`;
  return `${hrs}h ${mins}m`;
};

const formatDurationInput = (seconds: number): string => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${hrs}:${mins.toString().padStart(2, '0')}`;
};

const parseDurationInput = (input: string): number => {
  const parts = input.split(':').map(p => parseInt(p, 10) || 0);
  if (parts.length === 1) return parts[0] * 3600; // Just hours
  return (parts[0] || 0) * 3600 + (parts[1] || 0) * 60;
};

export default function TimeTracker({ refreshTrigger = 0, onEntryCreated }: TimeTrackerProps) {
  const [projects, setProjects] = useState<ProjectWithClient[]>([]);
  const [recentEntries, setRecentEntries] = useState<ApiTimeEntry[]>([]);
  const [todayEntries, setTodayEntries] = useState<ApiTimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Timer state
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [selectedProject, setSelectedProject] = useState<ProjectWithClient | null>(null);
  const [description, setDescription] = useState('');
  const [billable, setBillable] = useState(true);

  // Edit state
  const [editingEntry, setEditingEntry] = useState<ApiTimeEntry | null>(null);
  const [editProjectId, setEditProjectId] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDuration, setEditDuration] = useState('');
  const [editBillable, setEditBillable] = useState(true);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  // Fetch projects and recent entries
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [projectsRes, entriesRes] = await Promise.all([
          fetch('/api/projects'),
          fetch('/api/time-entries'),
        ]);

        if (!projectsRes.ok) throw new Error('Failed to fetch projects');
        if (!entriesRes.ok) throw new Error('Failed to fetch time entries');

        const [projectsData, entriesData] = await Promise.all([
          projectsRes.json(),
          entriesRes.json(),
        ]);

        setProjects(projectsData.projects || []);
        const allEntries = entriesData.timeEntries || [];
        setRecentEntries(allEntries.slice(0, 10));

        // Filter today's entries
        const today = new Date().toDateString();
        setTodayEntries(allEntries.filter((e: ApiTimeEntry) =>
          new Date(e.date).toDateString() === today
        ));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [refreshTrigger]);

  // Timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerState === 'running') {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerState]);

  // Timer controls
  const handleStart = () => {
    setTimerState('running');
  };

  const handlePause = () => {
    setTimerState('paused');
  };

  const handleResume = () => {
    setTimerState('running');
  };

  const handleReset = () => {
    setTimerState('idle');
    setElapsedSeconds(0);
    setDescription('');
    setBillable(true);
  };

  const handleStop = useCallback(async () => {
    if (!selectedProject || elapsedSeconds === 0) return;

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/time-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: selectedProject.id,
          description,
          duration: elapsedSeconds,
          date: new Date().toISOString(),
          billable,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save time entry');
      }

      // Reset timer
      setTimerState('idle');
      setElapsedSeconds(0);
      setDescription('');
      setBillable(true);

      // Refresh entries
      const entriesRes = await fetch('/api/time-entries');
      const entriesData = await entriesRes.json();
      const allEntries = entriesData.timeEntries || [];
      setRecentEntries(allEntries.slice(0, 10));

      const today = new Date().toDateString();
      setTodayEntries(allEntries.filter((e: ApiTimeEntry) =>
        new Date(e.date).toDateString() === today
      ));

      // Notify parent
      onEntryCreated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save entry');
    } finally {
      setSubmitting(false);
    }
  }, [selectedProject, elapsedSeconds, description, billable, onEntryCreated]);

  // Edit functions
  const startEdit = (entry: ApiTimeEntry) => {
    setEditingEntry(entry);
    setEditProjectId(entry.projectId);
    setEditDescription(entry.description || '');
    setEditDuration(formatDurationInput(entry.duration));
    setEditBillable(entry.billable);
  };

  const cancelEdit = () => {
    setEditingEntry(null);
    setEditProjectId('');
    setEditDescription('');
    setEditDuration('');
    setEditBillable(true);
  };

  const saveEdit = async () => {
    if (!editingEntry) return;

    setEditLoading(true);
    setError(null);

    try {
      const duration = parseDurationInput(editDuration);
      const response = await fetch(`/api/time-entries/${editingEntry.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: editProjectId,
          description: editDescription,
          duration,
          billable: editBillable,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update entry');
      }

      // Refresh entries
      const entriesRes = await fetch('/api/time-entries');
      const entriesData = await entriesRes.json();
      const allEntries = entriesData.timeEntries || [];
      setRecentEntries(allEntries.slice(0, 10));

      const today = new Date().toDateString();
      setTodayEntries(allEntries.filter((e: ApiTimeEntry) =>
        new Date(e.date).toDateString() === today
      ));

      cancelEdit();
      onEntryCreated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update entry');
    } finally {
      setEditLoading(false);
    }
  };

  const deleteEntry = async (id: string) => {
    setDeleteLoading(id);
    setError(null);

    try {
      const response = await fetch(`/api/time-entries/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete entry');
      }

      // Refresh entries
      const entriesRes = await fetch('/api/time-entries');
      const entriesData = await entriesRes.json();
      const allEntries = entriesData.timeEntries || [];
      setRecentEntries(allEntries.slice(0, 10));

      const today = new Date().toDateString();
      setTodayEntries(allEntries.filter((e: ApiTimeEntry) =>
        new Date(e.date).toDateString() === today
      ));

      onEntryCreated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete entry');
    } finally {
      setDeleteLoading(null);
    }
  };

  // Calculate today's totals
  const todayTotalSeconds = todayEntries.reduce((sum, entry) => sum + entry.duration, 0);
  const todayBillableSeconds = todayEntries
    .filter(e => e.billable)
    .reduce((sum, entry) => sum + entry.duration, 0);

  const activeProjects = projects.filter((p) => p.status === 'IN_PROGRESS');

  if (loading) {
    return (
      <div className="border border-white/10 bg-[#141414] rounded-lg overflow-hidden">
        <div className="p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-white/10 border-t-[#ff006e] rounded-full mx-auto mb-4" />
          <p className="font-[var(--font-jetbrains-mono)] text-sm text-white/60">[LOADING...]</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Timer Card */}
      <div className="border border-white/10 bg-[#141414] rounded-lg overflow-hidden">
        <div className="border-b border-white/10 p-3 sm:p-4 bg-[#0a0a0a]">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-bold tracking-wider font-[var(--font-space-grotesk)] text-sm sm:text-base">
              TIME TRACKER
            </h2>
            <span className="text-xs tracking-[0.2em] text-[#ff006e] font-[var(--font-jetbrains-mono)]">
              [{timerState.toUpperCase()}]
            </span>
          </div>
        </div>

        <div className="p-3 sm:p-6">
          {/* Project Selector */}
          <div className="mb-4 sm:mb-6">
            <label className="block text-xs tracking-[0.2em] mb-2 text-white/60 font-[var(--font-jetbrains-mono)]">
              [PROJECT]
            </label>
            <select
              value={selectedProject?.id || ''}
              onChange={(e) => {
                const project = projects.find((p) => p.id === e.target.value);
                setSelectedProject(project || null);
              }}
              disabled={timerState !== 'idle'}
              className="w-full bg-[#1a1a1a] border border-white/10 text-white px-3 sm:px-4 py-2 sm:py-3 text-sm outline-none focus:border-white/30 transition-colors disabled:opacity-50 rounded font-[var(--font-jetbrains-mono)] min-h-[44px]"
            >
              <option value="">SELECT PROJECT</option>
              {activeProjects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name} — {project.client?.name || 'Unknown'}
                </option>
              ))}
              {activeProjects.length === 0 && (
                <option value="" disabled>
                  NO ACTIVE PROJECTS
                </option>
              )}
            </select>
          </div>

          {/* Description */}
          <div className="mb-4 sm:mb-6">
            <label className="block text-xs tracking-[0.2em] mb-2 text-white/60 font-[var(--font-jetbrains-mono)]">
              [DESCRIPTION]
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="WHAT ARE YOU WORKING ON?"
              disabled={timerState !== 'idle' && timerState !== 'running'}
              className="w-full bg-[#1a1a1a] border border-white/10 text-white px-3 sm:px-4 py-2 sm:py-3 text-sm outline-none focus:border-white/30 transition-colors placeholder:text-white/30 rounded font-[var(--font-jetbrains-mono)] min-h-[44px]"
            />
          </div>

          {/* Timer Display */}
          <div className="mb-4 sm:mb-6">
            <div className="border-4 border-[#0a0a0a] bg-[#0a0a0a] p-4 sm:p-6 text-center rounded-lg">
              <motion.div
                className="text-3xl sm:text-5xl md:text-6xl font-bold text-white tracking-wider font-[var(--font-space-grotesk)]"
              >
                {formatDuration(elapsedSeconds)}
              </motion.div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-6">
            {timerState === 'idle' && (
              <motion.button
                onClick={handleStart}
                disabled={!selectedProject}
                className="flex-1 min-w-[120px] bg-[#8338ec] text-white px-4 sm:px-6 py-3 sm:py-4 font-bold tracking-wider flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed rounded hover:bg-[#8338ec]/80 transition-colors font-[var(--font-jetbrains-mono)] min-h-[44px] sm:min-h-[56px]"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Play className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" />
                <span className="hidden sm:inline">START</span>
                <span className="sm:hidden">START</span>
              </motion.button>
            )}

            {timerState === 'running' && (
              <>
                <motion.button
                  onClick={handlePause}
                  className="flex-1 min-w-[100px] bg-white/10 text-white px-4 sm:px-6 py-3 sm:py-4 font-bold tracking-wider flex items-center justify-center gap-2 border border-white/10 rounded hover:bg-white/20 transition-colors font-[var(--font-jetbrains-mono)] min-h-[44px] sm:min-h-[56px]"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Pause className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" />
                  <span className="hidden sm:inline">PAUSE</span>
                  <span className="sm:hidden">||</span>
                </motion.button>
                <motion.button
                  onClick={handleStop}
                  disabled={submitting}
                  className="flex-1 min-w-[100px] bg-[#ff006e] text-white px-4 sm:px-6 py-3 sm:py-4 font-bold tracking-wider flex items-center justify-center gap-2 disabled:opacity-50 rounded hover:bg-[#ff006e]/80 transition-colors font-[var(--font-jetbrains-mono)] min-h-[44px] sm:min-h-[56px]"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Square className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" />
                  {submitting ? '...' : <span className="hidden sm:inline">STOP</span>}
                  {submitting ? '' : <span className="sm:hidden">■</span>}
                </motion.button>
              </>
            )}

            {timerState === 'paused' && (
              <>
                <motion.button
                  onClick={handleResume}
                  className="flex-1 min-w-[100px] bg-[#8338ec] text-white px-4 sm:px-6 py-3 sm:py-4 font-bold tracking-wider flex items-center justify-center gap-2 rounded hover:bg-[#8338ec]/80 transition-colors font-[var(--font-jetbrains-mono)] min-h-[44px] sm:min-h-[56px]"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Play className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" />
                  <span className="hidden sm:inline">RESUME</span>
                  <span className="sm:hidden">▶</span>
                </motion.button>
                <motion.button
                  onClick={handleStop}
                  disabled={submitting}
                  className="flex-1 min-w-[100px] bg-[#ff006e] text-white px-4 sm:px-6 py-3 sm:py-4 font-bold tracking-wider flex items-center justify-center gap-2 disabled:opacity-50 rounded hover:bg-[#ff006e]/80 transition-colors font-[var(--font-jetbrains-mono)] min-h-[44px] sm:min-h-[56px]"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                  {submitting ? '...' : <span className="hidden sm:inline">SAVE</span>}
                  {submitting ? '' : <span className="sm:hidden">✓</span>}
                </motion.button>
                <motion.button
                  onClick={handleReset}
                  className="px-3 sm:px-4 py-3 sm:py-4 bg-white/5 border border-white/10 text-white/60 rounded hover:bg-[#ff006e] hover:text-white hover:border-[#ff006e] transition-colors min-h-[44px] sm:min-h-[56px] min-w-[44px]"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-sm">↺</span>
                </motion.button>
              </>
            )}
          </div>

          {/* Billable Toggle */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => timerState === 'idle' && setBillable(!billable)}
                className={`w-12 h-6 border border-white/10 relative cursor-pointer transition-colors rounded ${
                  billable ? 'bg-[#ff006e]' : 'bg-[#1a1a1a]'
                } ${timerState !== 'idle' ? 'opacity-50' : ''}`}
              >
                <motion.div
                  className="absolute top-0.5 w-4 h-4 bg-white rounded"
                  animate={{ left: billable ? 'calc(100% - 1.25rem)' : '0.25rem' }}
                  transition={{ duration: 0.2 }}
                />
              </div>
              <span className="text-xs tracking-[0.2em] uppercase text-white/60 font-[var(--font-jetbrains-mono)]">
                {billable ? 'BILLABLE' : 'NON-BILLABLE'}
              </span>
            </label>

            {selectedProject && timerState !== 'idle' && (
              <span className="text-xs text-white/60 font-[var(--font-jetbrains-mono)] truncate max-w-[200px]">
                PROJECT: <span className="font-bold text-white">{selectedProject.name}</span>
              </span>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-3 border border-white/10 bg-[#ff006e]/20 text-white rounded">
              <p className="text-xs flex items-center gap-2 font-[var(--font-jetbrains-mono)]">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="break-words">{error}</span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Today's Summary */}
      <div className="border border-white/10 bg-[#1a1a1a] rounded-lg overflow-hidden">
        <div className="border-b border-white/10 p-3 sm:p-4 flex items-center justify-between">
          <h3 className="font-bold tracking-wider text-white font-[var(--font-space-grotesk)] text-sm sm:text-base">
            TODAY'S SUMMARY
          </h3>
          <span className="text-xs text-white/60 font-[var(--font-jetbrains-mono)]">
            {todayEntries.length} ENTRIES
          </span>
        </div>
        <div className="p-3 sm:p-4 grid grid-cols-2 gap-3 sm:gap-4">
          <div>
            <p className="text-xs text-white/50 mb-1 font-[var(--font-jetbrains-mono)]">
              TOTAL HOURS
            </p>
            <p className="text-xl sm:text-2xl font-bold text-white font-[var(--font-space-grotesk)]">
              {formatDurationShort(todayTotalSeconds)}
            </p>
          </div>
          <div>
            <p className="text-xs text-white/50 mb-1 font-[var(--font-jetbrains-mono)]">
              BILLABLE
            </p>
            <p className="text-xl sm:text-2xl font-bold text-[#ff006e] font-[var(--font-space-grotesk)]">
              {formatDurationShort(todayBillableSeconds)}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Entries */}
      <div className="border border-white/10 bg-[#141414] rounded-lg overflow-hidden">
        <div className="border-b border-white/10 p-3 sm:p-4 bg-[#0a0a0a]">
          <h3 className="font-bold tracking-wider text-white font-[var(--font-space-grotesk)] text-sm sm:text-base">
            RECENT ENTRIES
          </h3>
        </div>
        <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto">
          {recentEntries.length === 0 ? (
            <div className="p-8 text-center">
              <Clock className="w-8 h-8 mx-auto mb-2 text-white/20" />
              <p className="text-xs text-white/50 font-[var(--font-jetbrains-mono)]">
                NO ENTRIES YET
              </p>
            </div>
          ) : (
            recentEntries.map((entry) => (
              <div
                key={entry.id}
                className="p-3 sm:p-4 hover:bg-white/5 transition-colors"
              >
                {editingEntry?.id === entry.id ? (
                  // Edit Form
                  <div className="space-y-3 border border-white/10 bg-[#0a0a0a] p-3 sm:p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-xs tracking-[0.2em] text-white/60 font-[var(--font-jetbrains-mono)]">
                        [EDITING]
                      </span>
                      <button
                        onClick={cancelEdit}
                        disabled={editLoading}
                        className="p-1 text-white/60 hover:text-[#ff006e] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                        aria-label="Cancel edit"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Project Select */}
                    <select
                      value={editProjectId}
                      onChange={(e) => setEditProjectId(e.target.value)}
                      disabled={editLoading}
                      className="w-full bg-[#1a1a1a] border border-white/10 text-white px-3 py-2 text-sm rounded font-[var(--font-jetbrains-mono)] min-h-[44px]"
                    >
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} — {p.client?.name || 'Unknown'}
                        </option>
                      ))}
                    </select>

                    {/* Description */}
                    <input
                      type="text"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Description"
                      disabled={editLoading}
                      className="w-full bg-[#1a1a1a] border border-white/10 text-white px-3 py-2 text-sm placeholder:text-white/30 rounded font-[var(--font-jetbrains-mono)] min-h-[44px]"
                    />

                    {/* Duration & Billable */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={editDuration}
                        onChange={(e) => setEditDuration(e.target.value)}
                        placeholder="H:MM"
                        disabled={editLoading}
                        className="w-full sm:w-24 bg-[#1a1a1a] border border-white/10 text-white px-3 py-2 text-sm text-center placeholder:text-white/30 rounded font-[var(--font-jetbrains-mono)] min-h-[44px]"
                      />
                      <button
                        type="button"
                        onClick={() => setEditBillable(!editBillable)}
                        disabled={editLoading}
                        className={`flex-1 px-3 py-2 text-xs border rounded transition-colors font-[var(--font-jetbrains-mono)] min-h-[44px] ${
                          editBillable
                            ? 'border-[#ff006e] bg-[#ff006e] text-white'
                            : 'border-white/10 bg-[#1a1a1a] text-white/60 hover:border-white/20'
                        }`}
                      >
                        {editBillable ? 'BILLABLE' : 'NON-BILLABLE'}
                      </button>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={cancelEdit}
                        disabled={editLoading}
                        className="flex-1 border border-white/10 bg-[#1a1a1a] text-white px-3 py-2 text-xs hover:bg-white/10 transition-colors rounded font-[var(--font-jetbrains-mono)] min-h-[44px]"
                      >
                        CANCEL
                      </button>
                      <button
                        onClick={saveEdit}
                        disabled={editLoading}
                        className="flex-1 border border-white/10 bg-[#ff006e] text-white px-3 py-2 text-xs hover:bg-[#ff006e]/80 transition-colors rounded font-[var(--font-jetbrains-mono)] min-h-[44px]"
                      >
                        {editLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                        ) : (
                          'SAVE'
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  // Display Mode
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <p className="font-bold text-sm text-white font-[var(--font-space-grotesk)] truncate">
                        {entry.project?.name || 'Unknown Project'}
                      </p>
                      <p className="text-xs text-white/50 truncate font-[var(--font-jetbrains-mono)]">
                        {entry.description || 'No description'} — {entry.project?.client?.name || 'Unknown'}
                      </p>
                      <p className="text-xs text-white/40 mt-1 font-[var(--font-jetbrains-mono)]">
                        {new Date(entry.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                      <span
                        className={`px-2 py-1 text-xs border rounded font-[var(--font-jetbrains-mono)] whitespace-nowrap ${
                          entry.billable
                            ? 'bg-[#ff006e] text-white border-[#ff006e]'
                            : 'bg-white/5 text-white/60 border-white/10'
                        }`}
                      >
                        {entry.billable ? 'BILL' : 'NON-BILL'}
                      </span>
                      <span className="text-sm font-bold text-white font-[var(--font-jetbrains-mono)] whitespace-nowrap">
                        {formatDurationShort(entry.duration)}
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => startEdit(entry)}
                          disabled={deleteLoading === entry.id}
                          className="p-1.5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white transition-colors rounded min-h-[44px] min-w-[44px] flex items-center justify-center"
                          aria-label="Edit entry"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteEntry(entry.id)}
                          disabled={deleteLoading === entry.id}
                          className="p-1.5 border border-white/10 text-white/60 hover:bg-[#ff006e] hover:text-white hover:border-[#ff006e] transition-colors rounded min-h-[44px] min-w-[44px] flex items-center justify-center"
                          aria-label="Delete entry"
                        >
                          {deleteLoading === entry.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
