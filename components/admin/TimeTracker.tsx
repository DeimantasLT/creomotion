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
      <div className="border-2 border-black bg-white" style={{ boxShadow: '4px 4px 0 0 #000' }}>
        <div className="p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-black border-t-[#FF2E63] rounded-full mx-auto mb-4" />
          <p className="font-mono text-sm">[LOADING...]</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Timer Card */}
      <div className="border-2 border-black bg-white" style={{ boxShadow: '4px 4px 0 0 #000' }}>
        <div className="border-b-2 border-black p-4 bg-black">
          <div className="flex items-center justify-between">
            <h2
              className="text-[#F5F5F0] font-bold tracking-wider"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              TIME TRACKER
            </h2>
            <span
              className="text-xs tracking-[0.2em] text-[#FF2E63]"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              [{timerState.toUpperCase()}]
            </span>
          </div>
        </div>

        <div className="p-6">
          {/* Project Selector */}
          <div className="mb-6">
            <label
              className="block text-xs tracking-[0.2em] mb-2 text-black/60"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              [PROJECT]
            </label>
            <select
              value={selectedProject?.id || ''}
              onChange={(e) => {
                const project = projects.find((p) => p.id === e.target.value);
                setSelectedProject(project || null);
              }}
              disabled={timerState !== 'idle'}
              className="w-full border-2 border-black bg-[#F5F5F0] px-4 py-3 text-sm outline-none focus:bg-black focus:text-white transition-colors disabled:opacity-50"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
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
          <div className="mb-6">
            <label
              className="block text-xs tracking-[0.2em] mb-2 text-black/60"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              [DESCRIPTION]
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="WHAT ARE YOU WORKING ON?"
              disabled={timerState !== 'idle' && timerState !== 'running'}
              className="w-full border-2 border-black bg-[#F5F5F0] px-4 py-3 text-sm outline-none focus:bg-black focus:text-white transition-colors"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            />
          </div>

          {/* Timer Display */}
          <div className="mb-6">
            <div className="border-4 border-black bg-black p-6 text-center">
              <motion.div
                className="text-5xl md:text-6xl font-bold text-white tracking-wider"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {formatDuration(elapsedSeconds)}
              </motion.div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-3 mb-6">
            {timerState === 'idle' && (
              <motion.button
                onClick={handleStart}
                disabled={!selectedProject}
                className="flex-1 border-2 border-black bg-[#FF2E63] text-white px-6 py-4 font-bold tracking-wider flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  boxShadow: '4px 4px 0 0 #000',
                }}
                whileHover={{ x: -2, y: -2, boxShadow: '6px 6px 0 0 #000' }}
                whileTap={{ x: 0, y: 0, boxShadow: '2px 2px 0 0 #000' }}
              >
                <Play className="w-5 h-5" fill="currentColor" />
                START
              </motion.button>
            )}

            {timerState === 'running' && (
              <>
                <motion.button
                  onClick={handlePause}
                  className="flex-1 border-2 border-black bg-black text-white px-6 py-4 font-bold tracking-wider flex items-center justify-center gap-3"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    boxShadow: '4px 4px 0 0 #000',
                  }}
                  whileHover={{ x: -2, y: -2, boxShadow: '6px 6px 0 0 #000' }}
                  whileTap={{ x: 0, y: 0, boxShadow: '2px 2px 0 0 #000' }}
                >
                  <Pause className="w-5 h-5" fill="currentColor" />
                  PAUSE
                </motion.button>
                <motion.button
                  onClick={handleStop}
                  disabled={submitting}
                  className="flex-1 border-2 border-black bg-white px-6 py-4 font-bold tracking-wider flex items-center justify-center gap-3 disabled:opacity-50"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    boxShadow: '4px 4px 0 0 #000',
                  }}
                  whileHover={{ x: -2, y: -2, boxShadow: '6px 6px 0 0 #000', backgroundColor: '#000', color: '#fff' }}
                  whileTap={{ x: 0, y: 0, boxShadow: '2px 2px 0 0 #000' }}
                >
                  <Square className="w-5 h-5" fill="currentColor" />
                  {submitting ? 'SAVING...' : 'STOP'}
                </motion.button>
              </>
            )}

            {timerState === 'paused' && (
              <>
                <motion.button
                  onClick={handleResume}
                  className="flex-1 border-2 border-black bg-[#FF2E63] text-white px-6 py-4 font-bold tracking-wider flex items-center justify-center gap-3"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    boxShadow: '4px 4px 0 0 #000',
                  }}
                  whileHover={{ x: -2, y: -2, boxShadow: '6px 6px 0 0 #000' }}
                  whileTap={{ x: 0, y: 0, boxShadow: '2px 2px 0 0 #000' }}
                >
                  <Play className="w-5 h-5" fill="currentColor" />
                  RESUME
                </motion.button>
                <motion.button
                  onClick={handleStop}
                  disabled={submitting}
                  className="flex-1 border-2 border-black bg-white px-6 py-4 font-bold tracking-wider flex items-center justify-center gap-3 disabled:opacity-50"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    boxShadow: '4px 4px 0 0 #000',
                  }}
                  whileHover={{ x: -2, y: -2, boxShadow: '6px 6px 0 0 #000', backgroundColor: '#000', color: '#fff' }}
                  whileTap={{ x: 0, y: 0, boxShadow: '2px 2px 0 0 #000' }}
                >
                  <Check className="w-5 h-5" />
                  {submitting ? 'SAVING...' : 'SAVE'}
                </motion.button>
                <motion.button
                  onClick={handleReset}
                  className="px-4 py-4 border-2 border-black bg-[#F5F5F0]"
                  style={{ boxShadow: '4px 4px 0 0 #000' }}
                  whileHover={{ x: -2, y: -2, boxShadow: '6px 6px 0 0 #000', backgroundColor: '#FF2E63', color: '#fff', borderColor: '#FF2E63' }}
                  whileTap={{ x: 0, y: 0, boxShadow: '2px 2px 0 0 #000' }}
                >
                  <span className="text-sm">↺</span>
                </motion.button>
              </>
            )}
          </div>

          {/* Billable Toggle */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => timerState === 'idle' && setBillable(!billable)}
                className={`w-12 h-6 border-2 border-black relative cursor-pointer transition-colors ${
                  billable ? 'bg-[#FF2E63]' : 'bg-[#F5F5F0]'
                } ${timerState !== 'idle' ? 'opacity-50' : ''}`}
              >
                <motion.div
                  className="absolute top-0.5 w-4 h-4 bg-black"
                  animate={{ left: billable ? 'calc(100% - 1.25rem)' : '0.25rem' }}
                  transition={{ duration: 0.2 }}
                />
              </div>
              <span
                className="text-xs tracking-[0.2em] uppercase"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {billable ? 'BILLABLE' : 'NON-BILLABLE'}
              </span>
            </label>

            {selectedProject && timerState !== 'idle' && (
              <span
                className="text-xs"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                PROJECT: <span className="font-bold">{selectedProject.name}</span>
              </span>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-3 border-2 border-black bg-[#FF2E63] text-white">
              <p
                className="text-xs flex items-center gap-2"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                <AlertCircle className="w-4 h-4" />
                {error}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Today's Summary */}
      <div className="border-2 border-black bg-[#F5F5F0]" style={{ boxShadow: '4px 4px 0 0 #000' }}>
        <div className="border-b-2 border-black p-4 flex items-center justify-between">
          <h3
            className="font-bold tracking-wider"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            TODAY'S SUMMARY
          </h3>
          <span
            className="text-xs"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {todayEntries.length} ENTRIES
          </span>
        </div>
        <div className="p-4 grid grid-cols-2 gap-4">
          <div>
            <p
              className="text-xs text-black/50 mb-1"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              TOTAL HOURS
            </p>
            <p
              className="text-2xl font-bold"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {formatDurationShort(todayTotalSeconds)}
            </p>
          </div>
          <div>
            <p
              className="text-xs text-black/50 mb-1"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              BILLABLE
            </p>
            <p
              className="text-2xl font-bold text-[#FF2E63]"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {formatDurationShort(todayBillableSeconds)}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Entries */}
      <div className="border-2 border-black bg-white" style={{ boxShadow: '4px 4px 0 0 #000' }}>
        <div className="border-b-2 border-black p-4 bg-[#F5F5F0]">
          <h3
            className="font-bold tracking-wider"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            RECENT ENTRIES
          </h3>
        </div>
        <div className="divide-y-2 divide-black/10">
          {recentEntries.length === 0 ? (
            <div className="p-8 text-center">
              <Clock className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p
                className="text-xs text-black/50"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                NO ENTRIES YET
              </p>
            </div>
          ) : (
            recentEntries.map((entry) => (
              <div
                key={entry.id}
                className="p-4"
              >
                {editingEntry?.id === entry.id ? (
                  // Edit Form
                  <div className="space-y-3 border-2 border-black bg-[#F5F5F0] p-4">
                    <div className="flex items-center justify-between">
                      <span
                        className="text-xs tracking-[0.2em]"
                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        [EDITING]
                      </span>
                      <button
                        onClick={cancelEdit}
                        disabled={editLoading}
                        className="p-1 hover:text-[#FF2E63]"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Project Select */}
                    <select
                      value={editProjectId}
                      onChange={(e) => setEditProjectId(e.target.value)}
                      disabled={editLoading}
                      className="w-full border-2 border-black bg-white px-3 py-2 text-sm"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
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
                      className="w-full border-2 border-black bg-white px-3 py-2 text-sm"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    />

                    {/* Duration & Billable */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editDuration}
                        onChange={(e) => setEditDuration(e.target.value)}
                        placeholder="H:MM"
                        disabled={editLoading}
                        className="w-24 border-2 border-black bg-white px-3 py-2 text-sm text-center"
                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                      />
                      <button
                        type="button"
                        onClick={() => setEditBillable(!editBillable)}
                        disabled={editLoading}
                        className={`flex-1 border-2 px-3 py-2 text-xs ${
                          editBillable
                            ? 'border-[#FF2E63] bg-[#FF2E63] text-white'
                            : 'border-black bg-white'
                        }`}
                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        {editBillable ? 'BILLABLE' : 'NON-BILLABLE'}
                      </button>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={cancelEdit}
                        disabled={editLoading}
                        className="flex-1 border-2 border-black bg-white px-3 py-2 text-xs hover:bg-black hover:text-white"
                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        CANCEL
                      </button>
                      <button
                        onClick={saveEdit}
                        disabled={editLoading}
                        className="flex-1 border-2 border-black bg-[#FF2E63] text-white px-3 py-2 text-xs hover:bg-black"
                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
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
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p
                        className="font-bold text-sm truncate"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                      >
                        {entry.project?.name || 'Unknown Project'}
                      </p>
                      <p
                        className="text-xs text-black/50 truncate"
                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        {entry.description || 'No description'} — {entry.project?.client?.name || 'Unknown'}
                      </p>
                      <p
                        className="text-xs text-black/40 mt-1"
                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        {new Date(entry.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2 py-1 text-xs border-2 ${
                          entry.billable
                            ? 'bg-[#FF2E63] text-white border-[#FF2E63]'
                            : 'bg-gray-100 text-gray-600 border-gray-300'
                        }`}
                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        {entry.billable ? 'BILL' : 'NON-BILL'}
                      </span>
                      <span
                        className="text-sm font-bold"
                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        {formatDurationShort(entry.duration)}
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => startEdit(entry)}
                          disabled={deleteLoading === entry.id}
                          className="p-1.5 border-2 border-black hover:bg-black hover:text-white transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteEntry(entry.id)}
                          disabled={deleteLoading === entry.id}
                          className="p-1.5 border-2 border-black hover:bg-[#FF2E63] hover:text-white hover:border-[#FF2E63] transition-colors"
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
