"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, DollarSign, FileText, ChevronDown, Plus, Download } from "lucide-react";
import { Client, Project } from "@/types";
import CreateInvoiceModal from "@/components/invoice/CreateInvoiceModal";

interface TimeEntry {
  id: string;
  userId: string;
  projectId: string;
  projectName: string;
  clientId: string;
  clientName: string;
  description: string;
  duration: number; // in seconds
  date: Date;
  billable: boolean;
  hourlyRate?: number;
  invoiced?: boolean;
}

interface TimeReportProps {
  refreshTrigger?: number;
}

type GroupBy = "project" | "client" | "date";

export default function TimeReport({ refreshTrigger = 0 }: TimeReportProps) {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState<string>(() => {
    return new Date().toISOString().split("T")[0];
  });
  
  const [groupBy, setGroupBy] = useState<GroupBy>("project");
  const [selectedEntries, setSelectedEntries] = useState<Set<string>>(new Set());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDateSelector, setShowDateSelector] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [entriesRes, projectsRes, clientsRes] = await Promise.all([
        fetch(`/api/time-entries?startDate=${startDate}&endDate=${endDate}`),
        fetch("/api/projects"),
        fetch("/api/clients"),
      ]);

      if (entriesRes.ok) {
        const data = await entriesRes.json();
        setTimeEntries(data.timeEntries || []);
      }

      if (projectsRes.ok) {
        const data = await projectsRes.json();
        setProjects(data.projects || []);
      }

      if (clientsRes.ok) {
        const data = await clientsRes.json();
        setClients(data.clients || []);
      }
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshTrigger]);

  // Filter billable entries only
  const billableEntries = useMemo(() => {
    return timeEntries.filter(e => e.billable && !e.invoiced);
  }, [timeEntries]);

  // Group entries
  const groupedData = useMemo(() => {
    const groups: Record<string, {
      id: string;
      name: string;
      clientName: string;
      clientId: string;
      projectId: string;
      entries: TimeEntry[];
      totalSeconds: number;
      totalAmount: number;
    }> = {};

    billableEntries.forEach(entry => {
      let key: string;
      
      switch (groupBy) {
        case "client":
          key = entry.clientId || "unknown";
          break;
        case "date":
          key = new Date(entry.date).toISOString().split("T")[0];
          break;
        case "project":
        default:
          key = entry.projectId;
          break;
      }

      if (!groups[key]) {
        const project = projects.find(p => p.id === entry.projectId);
        const client = clients.find(c => c.id === entry.clientId);
        
        groups[key] = {
          id: key,
          name: groupBy === "date" 
            ? new Date(key).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
            : entry.projectName || project?.name || "Unknown Project",
          clientName: entry.clientName || client?.name || "Unknown Client",
          clientId: entry.clientId,
          projectId: entry.projectId,
          entries: [],
          totalSeconds: 0,
          totalAmount: 0,
        };
      }

      groups[key].entries.push(entry);
      groups[key].totalSeconds += entry.duration;
      const rate = entry.hourlyRate || 100;
      groups[key].totalAmount += (entry.duration / 3600) * rate;
    });

    return Object.values(groups).sort((a, b) => b.totalSeconds - a.totalSeconds);
  }, [billableEntries, groupBy, projects, clients]);

  // Stats
  const stats = useMemo(() => {
    const totalHours = billableEntries.reduce((sum, e) => sum + e.duration, 0) / 3600;
    const totalAmount = groupedData.reduce((sum, g) => sum + g.totalAmount, 0);
    const avgRate = totalHours > 0 ? totalAmount / totalHours : 0;

    return {
      totalHours,
      totalAmount,
      avgRate,
      entryCount: billableEntries.length,
      groupCount: groupedData.length,
    };
  }, [billableEntries, groupedData]);

  const toggleEntry = (entryId: string) => {
    setSelectedEntries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(entryId)) {
        newSet.delete(entryId);
      } else {
        newSet.add(entryId);
      }
      return newSet;
    });
  };

  const toggleAllInGroup = (entries: TimeEntry[]) => {
    const entryIds = entries.map(e => e.id);
    const allSelected = entryIds.every(id => selectedEntries.has(id));
    
    setSelectedEntries(prev => {
      const newSet = new Set(prev);
      if (allSelected) {
        entryIds.forEach(id => newSet.delete(id));
      } else {
        entryIds.forEach(id => newSet.add(id));
      }
      return newSet;
    });
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IE", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  // Get selected time entries for invoice creation
  const selectedTimeEntriesData = useMemo(() => {
    return billableEntries.filter(e => selectedEntries.has(e.id));
  }, [billableEntries, selectedEntries]);

  const selectedTotal = useMemo(() => {
    return selectedTimeEntriesData.reduce((sum, e) => {
      const rate = e.hourlyRate || 100;
      return sum + (e.duration / 3600) * rate;
    }, 0);
  }, [selectedTimeEntriesData]);

  // Group selected by project for invoice creation
  const selectedByProject = useMemo(() => {
    const groups: Record<string, { 
      projectId: string; 
      clientId: string;
      entries: TimeEntry[];
      total: number;
    }> = {};
    
    selectedTimeEntriesData.forEach(entry => {
      if (!groups[entry.projectId]) {
        groups[entry.projectId] = {
          projectId: entry.projectId,
          clientId: entry.clientId,
          entries: [],
          total: 0,
        };
      }
      groups[entry.projectId].entries.push(entry);
      const rate = entry.hourlyRate || 100;
      groups[entry.projectId].total += (entry.duration / 3600) * rate;
    });
    
    return Object.values(groups);
  }, [selectedTimeEntriesData]);

  // Date range presets
  const setPresetRange = (preset: "thisWeek" | "lastWeek" | "thisMonth" | "lastMonth") => {
    const now = new Date();
    let start: Date;
    let end: Date;

    switch (preset) {
      case "thisWeek":
        start = new Date(now.setDate(now.getDate() - now.getDay()));
        end = new Date();
        break;
      case "lastWeek":
        start = new Date(now.setDate(now.getDate() - now.getDay() - 7));
        end = new Date(now.setDate(start.getDate() + 6));
        break;
      case "thisMonth":
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date();
        break;
      case "lastMonth":
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
    }

    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(end.toISOString().split("T")[0]);
    setShowDateSelector(false);
  };

  if (loading && timeEntries.length === 0) {
    return (
      <div className="border-2 border-black bg-white p-8">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-black border-t-[#FF2E63] rounded-full animate-spin mx-auto mb-4" />
          <p className="font-mono text-sm">LOADING TIME DATA...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <div className="border-2 border-black bg-white p-4" style={{ boxShadow: "4px 4px 0 0 #000" }}>
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            <span className="font-mono text-sm font-bold uppercase">Date Range:</span>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Start Date */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-gray-500">FROM</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border-2 border-black bg-[#F5F5F0] px-3 py-2 text-sm font-mono outline-none focus:bg-black focus:text-white transition-colors"
              />
            </div>
            
            {/* End Date */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-gray-500">TO</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border-2 border-black bg-[#F5F5F0] px-3 py-2 text-sm font-mono outline-none focus:bg-black focus:text-white transition-colors"
              />
            </div>

            {/* Preset Button */}
            <div className="relative">
              <button
                onClick={() => setShowDateSelector(!showDateSelector)}
                className="border-2 border-black bg-black text-white px-4 py-2 text-xs font-mono uppercase hover:bg-[#FF2E63] hover:border-[#FF2E63] transition-colors flex items-center gap-2"
              >
                PRESETS
                <ChevronDown className={`w-4 h-4 transition-transform ${showDateSelector ? "rotate-180" : ""}`} />
              </button>
              
              {showDateSelector && (
                <div className="absolute top-full left-0 mt-1 border-2 border-black bg-white z-20 min-w-[150px]">
                  {[
                    { id: "thisWeek", label: "This Week" },
                    { id: "lastWeek", label: "Last Week" },
                    { id: "thisMonth", label: "This Month" },
                    { id: "lastMonth", label: "Last Month" },
                  ].map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => setPresetRange(preset.id as any)}
                      className="w-full text-left px-4 py-2 text-sm font-mono hover:bg-[#FF2E63] hover:text-white transition-colors"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Group By */}
          <div className="flex items-center gap-2 lg:ml-auto">
            <span className="text-xs font-mono font-bold uppercase">Group By:</span>
            <div className="flex border-2 border-black">
              {(["project", "client", "date"] as GroupBy[]).map((g) => (
                <button
                  key={g}
                  onClick={() => setGroupBy(g)}
                  className={`px-3 py-2 text-xs font-mono uppercase transition-colors ${
                    groupBy === g ? "bg-black text-white" : "bg-white hover:bg-gray-100"
                  } ${g !== "project" ? "border-l-2 border-black" : ""}`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Hours", value: stats.totalHours.toFixed(1), icon: Clock, color: "bg-black text-white" },
          { label: "Entries", value: stats.entryCount, icon: FileText, color: "bg-white" },
          { label: "Value", value: formatCurrency(stats.totalAmount), icon: DollarSign, color: "bg-[#FF2E63] text-white" },
          { label: "Avg Rate", value: formatCurrency(stats.avgRate) + "/hr", icon: Clock, color: "bg-white" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`border-2 border-black p-4 ${stat.color}`}
            style={{ boxShadow: "4px 4px 0 0 #000" }}
          >
            <div className="flex items-center justify-between">
              <stat.icon className="w-5 h-5 opacity-50" />
              <span className="text-2xl font-bold font-display">{stat.value}</span>
            </div>
            <div className="text-xs font-mono mt-1 opacity-70">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Selected Summary */}
      {selectedEntries.size > 0 && (
        <div className="border-2 border-black bg-[#FF2E63] text-white p-4 sticky top-4 z-10" style={{ boxShadow: "4px 4px 0 0 #000" }}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="text-2xl font-bold font-display">{selectedEntries.size}</div>
              <div>
                <div className="font-bold">entries selected</div>
                <div className="text-sm opacity-80">{formatCurrency(selectedTotal)} total value</div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedEntries(new Set())}
                className="px-4 py-2 border-2 border-white text-xs font-mono uppercase hover:bg-white hover:text-[#FF2E63] transition-colors"
              >
                Clear
              </button>
              {selectedByProject.length === 1 && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-2 bg-black border-2 border-black text-white text-xs font-mono uppercase hover:bg-white hover:text-black transition-colors flex items-center gap-2"
                  style={{ boxShadow: "4px 4px 0 0 #000" }}
                >
                  <Plus className="w-4 h-4" />
                  Create Invoice
                </button>
              )}
            </div>
          </div>
          {selectedByProject.length > 1 && (
            <p className="text-xs mt-2 opacity-80">
              ⚠ Selection spans {selectedByProject.length} projects. Create separate invoices for each project.
            </p>
          )}
        </div>
      )}

      {/* Grouped Data */}
      <div className="space-y-4">
        {groupedData.length === 0 ? (
          <div className="border-2 border-black border-dashed p-12 text-center">
            <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 font-mono">NO BILLABLE TIME ENTRIES FOUND</p>
            <p className="text-gray-400 text-sm mt-2">Try adjusting your date range</p>
          </div>
        ) : (
          groupedData.map((group) => (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-2 border-black bg-white overflow-hidden"
            >
              {/* Group Header */}
              <div className="bg-black text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => toggleAllInGroup(group.entries)}
                    className="border-2 border-white p-1 hover:bg-white hover:text-black transition-colors"
                  >
                    {group.entries.every(e => selectedEntries.has(e.id)) ? (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <div className="w-4 h-4" />
                    )}
                  </button>
                  <div>
                    <div className="font-bold font-display text-lg">{group.name}</div>
                    <div className="text-xs font-mono opacity-70">{group.clientName}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-xl font-display">{formatCurrency(group.totalAmount)}</div>
                  <div className="text-xs font-mono opacity-70">{formatDuration(group.totalSeconds)}</div>
                </div>
              </div>

              {/* Entries Table */}
              <table className="w-full">
                <thead className="bg-[#F5F5F0]">
                  <tr>
                    <th className="p-3 w-12"></th>
                    <th className="p-3 text-left text-xs font-mono">DATE</th>
                    <th className="p-3 text-left text-xs font-mono">DESCRIPTION</th>
                    <th className="p-3 text-right text-xs font-mono">DURATION</th>
                    <th className="p-3 text-right text-xs font-mono">RATE</th>
                    <th className="p-3 text-right text-xs font-mono">AMOUNT</th>
                  </tr>
                </thead>
                <tbody>
                  {group.entries.map((entry, i) => {
                    const isSelected = selectedEntries.has(entry.id);
                    const rate = entry.hourlyRate || 100;
                    const amount = (entry.duration / 3600) * rate;
                    
                    return (
                      <tr
                        key={entry.id}
                        onClick={() => toggleEntry(entry.id)}
                        className={`cursor-pointer transition-colors ${
                          i % 2 === 1 ? "bg-gray-50" : ""
                        } ${isSelected ? "bg-[#FF2E63]/10" : "hover:bg-gray-100"}`}
                      >
                        <td className="p-3">
                          <div className={`w-6 h-6 border-2 border-black flex items-center justify-center transition-colors ${
                            isSelected ? "bg-[#FF2E63] border-[#FF2E63]" : ""
                          }`}>
                            {isSelected && (
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-sm font-mono">
                          {new Date(entry.date).toLocaleDateString("en-GB")}
                        </td>
                        <td className="p-3 text-sm">
                          {entry.description || "Work"}
                        </td>
                        <td className="p-3 text-sm font-mono text-right">
                          {formatDuration(entry.duration)}
                        </td>
                        <td className="p-3 text-sm font-mono text-right">
                          {formatCurrency(rate)}/hr
                        </td>
                        <td className="p-3 text-sm font-bold text-right">
                          {formatCurrency(amount)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-[#F5F5F0] border-t-2 border-black">
                  <tr>
                    <td colSpan={6} className="p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono">
                          {group.entries.length} entries
                        </span>
                        <button
                          onClick={() => {
                            const entries = group.entries;
                            setSelectedEntries(new Set(entries.map(e => e.id)));
                          }}
                          className="text-xs font-mono text-[#FF2E63] hover:underline"
                        >
                          Select all in this group
                        </button>
                      </div>
                    </td>
                  </tr>
                </tfoot>
              </table>

              {/* Create Invoice Button for Group */}
              <div className="p-4 border-t-2 border-black bg-gray-50">
                <button
                  onClick={() => {
                    setSelectedEntries(new Set(group.entries.map(e => e.id)));
                    setShowCreateModal(true);
                  }}
                  className="w-full border-2 border-black bg-black text-white py-3 font-bold uppercase tracking-wider text-sm flex items-center justify-center gap-2 hover:bg-[#FF2E63] hover:border-[#FF2E63] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  CREATE INVOICE FROM THIS {groupBy.toUpperCase()}
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Create Invoice Modal */}
      <CreateInvoiceModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setSelectedEntries(new Set());
          fetchData();
        }}
        preselectedProjectId={selectedByProject[0]?.projectId}
        preselectedClientId={selectedByProject[0]?.clientId}
        preselectedTimeEntries={selectedTimeEntriesData.map(e => ({
          ...e,
          startTime: new Date(e.date),
        }))}
      />
    </div>
  );
}
