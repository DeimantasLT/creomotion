"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Edit2, Trash2, Clock, ChevronLeft, ChevronRight, DollarSign, AlertCircle } from "lucide-react";

interface TimeEntry {
  id: string;
  projectId: string;
  projectName: string;
  clientName: string;
  description: string;
  duration: number;
  billable: boolean;
  startTime: Date;
  endTime?: Date;
}

interface TimeEntryListProps {
  entries: TimeEntry[];
  onEdit: (entry: TimeEntry) => void;
  onDelete: (id: string) => void;
  onToggleBillable: (id: string) => void;
  hourlyRate?: number;
}

type ViewMode = "daily" | "weekly" | "summary";

const formatDuration = (seconds: number): string => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hrs === 0) return `${mins}m`;
  if (mins === 0) return `${hrs}h`;
  return `${hrs}h ${mins}m`;
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const getWeekStart = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};

const getWeekEnd = (date: Date): Date => {
  const start = getWeekStart(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return end;
};

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
};

export default function TimeEntryList({
  entries,
  onEdit,
  onDelete,
  onToggleBillable,
  hourlyRate = 100,
}: TimeEntryListProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("daily");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  const [editForm, setEditForm] = useState<Partial<TimeEntry>>({});

  // Filter entries based on view mode
  const filteredEntries = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (viewMode) {
      case "daily": {
        const currentDay = new Date(currentDate);
        currentDay.setHours(0, 0, 0, 0);
        return entries.filter((entry) => {
          const entryDate = new Date(entry.startTime);
          entryDate.setHours(0, 0, 0, 0);
          return entryDate.getTime() === currentDay.getTime();
        });
      }
      case "weekly": {
        const weekStart = getWeekStart(currentDate);
        const weekEnd = getWeekEnd(currentDate);
        return entries.filter((entry) => {
          const entryDate = new Date(entry.startTime);
          return entryDate >= weekStart && entryDate <= weekEnd;
        });
      }
      case "summary":
        return entries;
      default:
        return entries;
    }
  }, [entries, viewMode, currentDate]);

  // Group entries by project for summary view
  const projectSummary = useMemo(() => {
    const grouped = new Map<string, { projectName: string; clientName: string; totalSeconds: number; billableSeconds: number; entries: TimeEntry[] }>();

    filteredEntries.forEach((entry) => {
      const existing = grouped.get(entry.projectId);
      if (existing) {
        existing.totalSeconds += entry.duration;
        if (entry.billable) existing.billableSeconds += entry.duration;
        existing.entries.push(entry);
      } else {
        grouped.set(entry.projectId, {
          projectName: entry.projectName,
          clientName: entry.clientName,
          totalSeconds: entry.duration,
          billableSeconds: entry.billable ? entry.duration : 0,
          entries: [entry],
        });
      }
    });

    return Array.from(grouped.entries()).map(([id, data]) => ({
      id,
      ...data,
      billableAmount: (data.billableSeconds / 3600) * hourlyRate,
    }));
  }, [filteredEntries, hourlyRate]);

  // Calculate totals
  const totals = useMemo(() => {
    const totalSeconds = filteredEntries.reduce((sum, e) => sum + e.duration, 0);
    const billableSeconds = filteredEntries.filter((e) => e.billable).reduce((sum, e) => sum + e.duration, 0);
    const billableAmount = (billableSeconds / 3600) * hourlyRate;
    const billablePercent = totalSeconds > 0 ? (billableSeconds / totalSeconds) * 100 : 0;

    return { totalSeconds, billableSeconds, billableAmount, billablePercent };
  }, [filteredEntries, hourlyRate]);

  const handleEditClick = (entry: TimeEntry) => {
    setEditingEntry(entry);
    setEditForm({
      description: entry.description,
      duration: entry.duration,
      billable: entry.billable,
    });
  };

  const handleSaveEdit = () => {
    if (editingEntry && editForm) {
      onEdit({ ...editingEntry, ...editForm } as TimeEntry);
      setEditingEntry(null);
    }
  };

  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    if (viewMode === "daily") {
      newDate.setDate(currentDate.getDate() + (direction === "next" ? 1 : -1));
    } else if (viewMode === "weekly") {
      newDate.setDate(currentDate.getDate() + (direction === "next" ? 7 : -7));
    } else {
      newDate.setMonth(currentDate.getMonth() + (direction === "next" ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  const getDateRangeLabel = () => {
    if (viewMode === "daily") {
      return formatDate(currentDate);
    } else if (viewMode === "weekly") {
      const start = getWeekStart(currentDate);
      const end = getWeekEnd(currentDate);
      return `${formatDate(start)} - ${formatDate(end)}`;
    } else {
      return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(currentDate);
    }
  };

  return (
    <div className="border-2 border-black bg-white" style={{ boxShadow: "8px 8px 0 0 #000" }}>
      {/* Header */}
      <div className="border-b-2 border-black bg-black text-white p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl font-bold tracking-tight">TIME ENTRIES</h3>
          <div className="flex gap-1">
            {(["daily", "weekly", "summary"] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 text-xs mono uppercase tracking-wider border-2 border-white ${
                  viewMode === mode ? "bg-[#FF2E63] text-white" : "bg-transparent text-white hover:bg-white hover:text-black"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Date Navigation */}
      <div className="border-b-2 border-black p-4 flex items-center justify-between bg-[#F5F5F0]">
        <button
          onClick={() => navigateDate("prev")}
          className="p-2 border-2 border-black hover:bg-black hover:text-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="mono text-sm font-bold tracking-wider">{getDateRangeLabel()}</span>
        <button
          onClick={() => navigateDate("next")}
          className="p-2 border-2 border-black hover:bg-black hover:text-white transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Totals Summary */}
      <div className="grid grid-cols-3 border-b-2 border-black">
        <div className="p-4 border-r-2 border-black">
          <div className="text-xs mono tracking-[0.2em] text-gray-500 mb-1">TOTAL TIME</div>
          <div className="font-display text-2xl font-bold">{formatDuration(totals.totalSeconds)}</div>
        </div>
        <div className="p-4 border-r-2 border-black">
          <div className="text-xs mono tracking-[0.2em] text-gray-500 mb-1">BILLABLE</div>
          <div className="font-display text-2xl font-bold">{formatDuration(totals.billableSeconds)}</div>
          <div className="text-xs mono text-[#FF2E63]">{totals.billablePercent.toFixed(0)}%</div>
        </div>
        <div className="p-4">
          <div className="text-xs mono tracking-[0.2em] text-gray-500 mb-1">AMOUNT</div>
          <div className="font-display text-2xl font-bold">{formatCurrency(totals.billableAmount)}</div>
          <div className="text-xs mono text-gray-500">€{hourlyRate}/hr</div>
        </div>
      </div>

      {/* Content */}
      <div className="max-h-[500px] overflow-y-auto">
        {viewMode === "summary" ? (
          // Summary View by Project
          projectSummary.length === 0 ? (
            <div className="p-8 text-center">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="mono text-sm text-gray-500">NO ENTRIES FOR THIS PERIOD</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-black text-white sticky top-0">
                <tr>
                  <th className="text-left p-4 text-xs mono">PROJECT</th>
                  <th className="text-left p-4 text-xs mono">CLIENT</th>
                  <th className="text-right p-4 text-xs mono">HOURS</th>
                  <th className="text-right p-4 text-xs mono">BILLABLE</th>
                  <th className="text-right p-4 text-xs mono">AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                {projectSummary.map((project, i) => (
                  <tr key={project.id} className={`border-b border-black ${i % 2 === 1 ? "bg-gray-50" : ""}`}>
                    <td className="p-4 font-bold">{project.projectName}</td>
                    <td className="p-4 mono text-sm text-gray-600">{project.clientName}</td>
                    <td className="p-4 text-right font-bold">{formatDuration(project.totalSeconds)}</td>
                    <td className="p-4 text-right">
                      <span className={project.billableSeconds > 0 ? "text-[#FF2E63] font-bold" : "text-gray-400"}>
                        {formatDuration(project.billableSeconds)}
                      </span>
                    </td>
                    <td className="p-4 text-right font-bold">{formatCurrency(project.billableAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        ) : (
          // Daily/Weekly List View
          filteredEntries.length === 0 ? (
            <div className="p-8 text-center">
              <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="mono text-sm text-gray-500">NO ENTRIES FOR THIS PERIOD</p>
            </div>
          ) : (
            <div className="divide-y-2 divide-black">
              {filteredEntries.map((entry) => (
                <motion.div
                  key={entry.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold">{entry.projectName}</span>
                        <span className="text-gray-400">—</span>
                        <span className="mono text-sm text-gray-600">{entry.clientName}</span>
                        {entry.billable ? (
                          <span className="px-2 py-0.5 bg-[#FF2E63] text-white text-xs mono">BILLABLE</span>
                        ) : (
                          <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs mono">NON-BILL</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{entry.description || "No description"}</p>
                      <div className="flex items-center gap-4 text-xs mono text-gray-500">
                        <span>{formatDate(new Date(entry.startTime))}</span>
                        <span>{new Date(entry.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        <span>→</span>
                        <span>{entry.endTime?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) || "..."}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-display text-xl font-bold">{formatDuration(entry.duration)}</div>
                        {entry.billable && (
                          <div className="text-xs mono text-[#FF2E63]">
                            <DollarSign className="w-3 h-3 inline" />
                            {formatCurrency((entry.duration / 3600) * hourlyRate)}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-1">
                        <button
                          onClick={() => onToggleBillable(entry.id)}
                          className={`p-2 border-2 border-black transition-colors ${
                            entry.billable ? "bg-[#FF2E63] text-white" : "bg-white hover:bg-gray-100"
                          }`}
                          title={entry.billable ? "Mark non-billable" : "Mark billable"}
                        >
                          <DollarSign className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditClick(entry)}
                          className="p-2 border-2 border-black bg-white hover:bg-black hover:text-white transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(entry.id)}
                          className="p-2 border-2 border-black bg-white hover:bg-[#FF2E63] hover:text-white hover:border-[#FF2E63] transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )
        )}
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingEntry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setEditingEntry(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="border-2 border-black bg-white p-6 max-w-md w-full mx-4"
              style={{ boxShadow: "8px 8px 0 0 #000" }}
              onClick={(e) => e.stopPropagation()}
            >
              <h4 className="font-display text-xl font-bold mb-4">EDIT ENTRY</h4>

              <div className="mb-4">
                <label className="block text-xs tracking-[0.2em] mb-2 uppercase mono">DESCRIPTION</label>
                <input
                  type="text"
                  value={editForm.description || ""}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full border-2 border-black bg-[#F5F5F0] px-4 py-3 text-sm outline-none focus:bg-black focus:text-white transition-colors mono"
                />
              </div>

              <div className="mb-4">
                <label className="block text-xs tracking-[0.2em] mb-2 uppercase mono">DURATION (MINUTES)</label>
                <input
                  type="number"
                  value={Math.floor((editForm.duration || 0) / 60)}
                  onChange={(e) => setEditForm({ ...editForm, duration: parseInt(e.target.value) * 60 })}
                  className="w-full border-2 border-black bg-[#F5F5F0] px-4 py-3 text-sm outline-none focus:bg-black focus:text-white transition-colors mono"
                />
              </div>

              <div className="mb-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.billable || false}
                    onChange={(e) => setEditForm({ ...editForm, billable: e.target.checked })}
                    className="w-5 h-5 border-2 border-black accent-[#FF2E63]"
                  />
                  <span className="mono text-xs tracking-[0.2em] uppercase">BILLABLE</span>
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 border-2 border-black bg-black text-white px-6 py-3 font-bold uppercase tracking-wider hover:bg-[#FF2E63] hover:border-[#FF2E63] transition-colors"
                >
                  SAVE
                </button>
                <button
                  onClick={() => setEditingEntry(null)}
                  className="flex-1 border-2 border-black bg-white px-6 py-3 font-bold uppercase tracking-wider hover:bg-gray-100 transition-colors"
                >
                  CANCEL
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

