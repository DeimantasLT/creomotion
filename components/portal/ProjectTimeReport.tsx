'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Calendar, ChevronDown, ChevronUp, User } from 'lucide-react';

interface TimeEntry {
  id: string;
  duration: number;
  date: string;
  description?: string;
  billable: boolean;
  user: {
    name: string;
  };
  task?: {
    name: string;
    category: string;
  };
}

interface ProjectTimeReportProps {
  projectId: string;
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

const formatDuration = (seconds: number): string => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hrs === 0) return `${mins}m`;
  if (mins === 0) return `${hrs}h`;
  return `${hrs}h ${mins}m`;
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('lt-LT', {
    month: 'short',
    day: 'numeric',
  });
};

export function ProjectTimeReport({ projectId }: ProjectTimeReportProps) {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchTimeEntries = async () => {
      try {
        const res = await fetch(`/api/projects/${projectId}/time-entries`);
        if (!res.ok) throw new Error('Failed to load time entries');
        const data = await res.json();
        setEntries(data.timeEntries || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setLoading(false);
      }
    };

    fetchTimeEntries();
  }, [projectId]);

  if (loading) {
    return (
      <div className="bg-[#141414] border border-white/10 p-6">
        <div className="flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-[#ff006e] border-t-transparent rounded-full animate-spin" />
          <span className="text-white/40 text-sm">Kraunama...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#141414] border border-red-500/30 p-4 text-red-400 text-sm">
        {error}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="bg-[#141414] border border-white/10 p-6 text-center">
        <Clock className="w-10 h-10 text-white/20 mx-auto mb-3" />
        <p className="text-white/60 text-sm">Laiko įrašų dar nėra.</p>
        <p className="text-white/40 text-xs mt-1">
          Čia matysite kiek laiko sugaišta projektui.
        </p>
      </div>
    );
  }

  // Calculate totals
  const totalSeconds = entries.reduce((sum, e) => sum + e.duration, 0);
  const totalHours = (totalSeconds / 3600).toFixed(1);

  // Group by category
  const byCategory: Record<string, number> = {};
  entries.forEach((entry) => {
    const cat = entry.task?.category || 'OTHER';
    byCategory[cat] = (byCategory[cat] || 0) + entry.duration;
  });

  // Group by user
  const byUser: Record<string, number> = {};
  entries.forEach((entry) => {
    const user = entry.user?.name || 'Unknown';
    byUser[user] = (byUser[user] || 0) + entry.duration;
  });

  const sortedCategories = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
  const sortedUsers = Object.entries(byUser).sort((a, b) => b[1] - a[1]);

  const displayEntries = showAll ? entries : entries.slice(0, 5);
  const hasMore = entries.length > 5;

  return (
    <div className="space-y-4">
      {/* Total Summary */}
      <div className="bg-[#141414] border border-white/10 p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-[#ff006e]/20 flex items-center justify-center">
            <Clock className="w-6 h-6 text-[#ff006e]" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{totalHours}h</p>
            <p className="text-xs text-white/40">Viso sugaišta laiko</p>
          </div>
        </div>

        {/* By Category */}
        {sortedCategories.length > 0 && (
          <div className="mb-4">
            <p className="text-[10px] uppercase text-white/40 mb-2 font-mono">Pagal kategoriją</p>
            <div className="space-y-1">
              {sortedCategories.map(([category, seconds]) => {
                const percentage = Math.round((seconds / totalSeconds) * 100);
                return (
                  <div key={category} className="flex items-center gap-2">
                    <span className="text-xs text-white/60 w-28">
                      {CATEGORY_LABELS[category] || category}
                    </span>
                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#8338ec] rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-white/40 w-16 text-right">
                      {formatDuration(seconds)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* By Team Member */}
        {sortedUsers.length > 1 && (
          <div>
            <p className="text-[10px] uppercase text-white/40 mb-2 font-mono">Pagal komandos narį</p>
            <div className="flex flex-wrap gap-2">
              {sortedUsers.map(([user, seconds]) => (
                <div
                  key={user}
                  className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded"
                >
                  <User className="w-3 h-3 text-white/40" />
                  <span className="text-xs text-white/70">{user}</span>
                  <span className="text-xs text-[#3a86ff] font-mono">
                    {formatDuration(seconds)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recent Entries */}
      <div className="bg-[#141414] border border-white/10">
        <div className="p-3 border-b border-white/10 bg-[#0a0a0a]">
          <p className="text-[10px] uppercase text-white/40 font-mono">Naujausi įrašai</p>
        </div>
        <div>
          {displayEntries.map((entry, index) => (
            <div
              key={entry.id}
              className={`p-3 flex items-center justify-between ${
                index < displayEntries.length - 1 ? 'border-b border-white/5' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-4 h-4 text-white/40" />
                </div>
                <div>
                  <p className="text-sm text-white/80">
                    {entry.task ? (
                      <>
                        <span className="text-[#3a86ff]">
                          [{CATEGORY_LABELS[entry.task.category] || entry.task.category}]
                        </span>{' '}
                        {entry.task.name}
                      </>
                    ) : (
                      entry.description || 'Darbo sesija'
                    )}
                  </p>
                  <p className="text-xs text-white/40">
                    {formatDate(entry.date)} • {entry.user.name}
                  </p>
                </div>
              </div>
              <span className="text-sm font-mono text-white/60">
                {formatDuration(entry.duration)}
              </span>
            </div>
          ))}
        </div>

        {hasMore && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="w-full p-3 text-xs text-white/50 hover:text-white/80 hover:bg-white/5 transition-colors flex items-center justify-center gap-1"
          >
            {showAll ? (
              <>
                Rodyti mažiau <ChevronUp className="w-3 h-3" />
              </>
            ) : (
              <>
                Visi įrašai ({entries.length}) <ChevronDown className="w-3 h-3" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
