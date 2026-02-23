'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { Task } from '@/hooks/useTasks';

interface TimerState {
  isRunning: boolean;
  elapsed: number;
  projectId: string;
  projectName: string;
  taskId: string | null;
  taskName: string | null;
  taskCategory: string | null;
  notes: string;
  startTime: number | null; // timestamp
}

interface TimerContextType {
  isRunning: boolean;
  elapsed: number;
  projectId: string;
  projectName: string;
  taskId: string | null;
  taskName: string | null;
  taskCategory: string | null;
  notes: string;
  startTimer: (data: {
    projectId: string;
    projectName: string;
    taskId?: string;
    taskName?: string;
    taskCategory?: string;
    notes?: string;
  }) => void;
  stopTimer: () => Promise<{ success: boolean; error?: string }>;
  formatTime: (seconds: number) => string;
}

const TimerContext = createContext<TimerContextType | null>(null);

const STORAGE_KEY = 'creomotion_active_timer';

export function TimerProvider({ children }: { children: ReactNode }) {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [projectId, setProjectId] = useState('');
  const [projectName, setProjectName] = useState('');
  const [taskId, setTaskId] = useState<string | null>(null);
  const [taskName, setTaskName] = useState<string | null>(null);
  const [taskCategory, setTaskCategory] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data: TimerState = JSON.parse(saved);
        if (data.isRunning && data.startTime) {
          // Calculate elapsed based on saved start time
          const now = Date.now();
          const savedElapsed = data.elapsed;
          const timeSinceStart = Math.floor((now - data.startTime) / 1000);
          const totalElapsed = savedElapsed + timeSinceStart;
          
          setIsRunning(true);
          setElapsed(totalElapsed);
          setProjectId(data.projectId);
          setProjectName(data.projectName);
          setTaskId(data.taskId);
          setTaskName(data.taskName);
          setTaskCategory(data.taskCategory);
          setNotes(data.notes);
          setStartTime(now - timeSinceStart * 1000);
        }
      }
    } catch (e) {
      console.error('Failed to load timer state:', e);
    }
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    if (isRunning) {
      const data: TimerState = {
        isRunning,
        elapsed,
        projectId,
        projectName,
        taskId,
        taskName,
        taskCategory,
        notes,
        startTime: startTime || Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [isRunning, elapsed, projectId, projectName, taskId, taskName, taskCategory, notes, startTime]);

  // Timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const startTimer = useCallback((data: {
    projectId: string;
    projectName: string;
    taskId?: string;
    taskName?: string;
    taskCategory?: string;
    notes?: string;
  }) => {
    setProjectId(data.projectId);
    setProjectName(data.projectName);
    setTaskId(data.taskId || null);
    setTaskName(data.taskName || null);
    setTaskCategory(data.taskCategory || null);
    setNotes(data.notes || '');
    setElapsed(0);
    setStartTime(Date.now());
    setIsRunning(true);
  }, []);

  const stopTimer = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (!isRunning || !projectId || elapsed === 0) {
      return { success: false, error: 'No active timer' };
    }

    try {
      const response = await fetch('/api/time-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          taskId: taskId || undefined,
          description: notes,
          duration: elapsed,
          date: new Date().toISOString(),
          billable: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save time entry');
      }

      // Reset state
      setIsRunning(false);
      setElapsed(0);
      setProjectId('');
      setProjectName('');
      setTaskId(null);
      setTaskName(null);
      setTaskCategory(null);
      setNotes('');
      setStartTime(null);
      localStorage.removeItem(STORAGE_KEY);

      return { success: true };
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to save';
      return { success: false, error };
    }
  }, [isRunning, projectId, taskId, elapsed, notes]);

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <TimerContext.Provider
      value={{
        isRunning,
        elapsed,
        projectId,
        projectName,
        taskId,
        taskName,
        taskCategory,
        notes,
        startTimer,
        stopTimer,
        formatTime,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
}

export function useGlobalTimer() {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useGlobalTimer must be used within TimerProvider');
  }
  return context;
}
