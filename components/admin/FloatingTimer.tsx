'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Square, Clock, ChevronDown, ChevronUp, Briefcase, CheckCircle2, AlertCircle } from 'lucide-react';
import { useGlobalTimer } from '@/hooks/useGlobalTimer';
import Link from 'next/link';

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

export function FloatingTimer() {
  const {
    isRunning,
    elapsed,
    projectName,
    taskName,
    taskCategory,
    notes,
    formatTime,
    stopTimer,
  } = useGlobalTimer();

  const [expanded, setExpanded] = useState(false);
  const [stopping, setStopping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isRunning) return null;

  const handleStop = async () => {
    setStopping(true);
    setError(null);
    const result = await stopTimer();
    if (!result.success) {
      setError(result.error || 'Failed to stop');
    }
    setStopping(false);
  };

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-4 right-4 z-[100]"
    >
      <div className="bg-[#141414] border border-[#ff006e]/50 rounded-sm shadow-2xl shadow-[#ff006e]/20 overflow-hidden min-w-[280px]">
        {/* Header - Always visible */}
        <div className="bg-[#ff006e] px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#0a0a0a] animate-pulse" />
            <span className="text-[#0a0a0a] font-bold font-mono text-sm">
              {formatTime(elapsed)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1 text-[#0a0a0a]/60 hover:text-[#0a0a0a]"
            >
              {expanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronUp className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={handleStop}
              disabled={stopping}
              className="p-1.5 bg-[#0a0a0a] text-[#ff006e] rounded hover:bg-[#0a0a0a]/80 disabled:opacity-50"
            >
              <Square className="w-3 h-3" fill="currentColor" />
            </button>
          </div>
        </div>

        {/* Expanded Details */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 space-y-3">
                {/* Project */}
                <div className="flex items-start gap-2">
                  <Briefcase className="w-4 h-4 text-[#8338ec] mt-0.5" />
                  <div>
                    <p className="text-[10px] uppercase text-white/40 font-mono">Project</p>
                    <p className="text-sm text-white/80">{projectName}</p>
                  </div>
                </div>

                {/* Task */}
                {taskName && (
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#3a86ff] mt-0.5" />
                    <div>
                      <p className="text-[10px] uppercase text-white/40 font-mono">Task</p>
                      <p className="text-sm text-white/80">
                        <span className="text-[#3a86ff]">
                          [{CATEGORY_LABELS[taskCategory || 'OTHER'] || taskCategory}]
                        </span>{' '}
                        {taskName}
                      </p>
                    </div>
                  </div>
                )}

                {/* Notes */}
                {notes && (
                  <div className="pt-2 border-t border-white/10">
                    <p className="text-[10px] uppercase text-white/40 font-mono mb-1">Notes</p>
                    <p className="text-xs text-white/60 italic">"{notes}"</p>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div className="flex items-center gap-2 text-red-400 text-xs">
                    <AlertCircle className="w-4 h-4" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Stop Button */}
                <button
                  onClick={handleStop}
                  disabled={stopping}
                  className="w-full py-2 bg-[#ff006e] text-[#0a0a0a] text-xs font-bold font-mono uppercase tracking-wider hover:bg-[#ff006e]/80 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Square className="w-3 h-3" fill="currentColor" />
                  {stopping ? 'Saving...' : 'STOP TIMER'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapsed hint */}
        {!expanded && (
          <div className="px-4 py-1.5 bg-[#0a0a0a] border-t border-[#ff006e]/20">
            <p className="text-[10px] text-white/40 truncate">
              {projectName}
              {taskName && ` • ${taskName}`}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
