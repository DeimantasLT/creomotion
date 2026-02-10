"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, X, Check, ChevronDown, Calendar, FileText, DollarSign, Percent, Clock } from "lucide-react";
import { Client, Project, InvoiceLineItem } from "@/types";

interface TimeEntry {
  id: string;
  projectId: string;
  projectName: string;
  clientName: string;
  description: string;
  duration: number; // in seconds
  billable: boolean;
  startTime: Date;
  hourlyRate?: number;
}

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  preselectedClientId?: string;
  preselectedProjectId?: string;
  preselectedTimeEntries?: TimeEntry[];
}

const generateInvoiceNumber = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
  return `INV-${year}-${month}-${random}`;
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
};

const formatDuration = (seconds: number): number => {
  return Math.round((seconds / 3600) * 10) / 10;
};

const today = () => new Date().toISOString().split("T")[0];
const defaultDueDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().split("T")[0];
};

export default function CreateInvoiceModal({
  isOpen,
  onClose,
  onSuccess,
  preselectedClientId,
  preselectedProjectId,
  preselectedTimeEntries = [],
}: CreateInvoiceModalProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showClientSelector, setShowClientSelector] = useState(false);
  const [showProjectSelector, setShowProjectSelector] = useState(false);
  
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([]);
  const [taxRate, setTaxRate] = useState(21);
  const [notes, setNotes] = useState("");
  const [dueDate, setDueDate] = useState(defaultDueDate());
  const [invoiceNumber, setInvoiceNumber] = useState(generateInvoiceNumber());
  const [showTimeEntrySelector, setShowTimeEntrySelector] = useState(false);

  // Load initial data
  useEffect(() => {
    if (isOpen) {
      fetchClientsAndProjects();
      fetchTimeEntries();
    }
  }, [isOpen]);

  // Preselect if provided
  useEffect(() => {
    if (preselectedClientId && clients.length > 0) {
      const client = clients.find(c => c.id === preselectedClientId);
      if (client) setSelectedClient(client);
    }
  }, [preselectedClientId, clients]);

  useEffect(() => {
    if (preselectedProjectId && projects.length > 0) {
      const project = projects.find(p => p.id === preselectedProjectId);
      if (project) setSelectedProject(project);
    }
  }, [preselectedProjectId, projects]);

  // Add preselected time entries
  useEffect(() => {
    if (preselectedTimeEntries.length > 0 && lineItems.length === 0) {
      const items = preselectedTimeEntries.map(entry => ({
        id: crypto.randomUUID(),
        description: entry.description || `${entry.projectName} - Work`,
        quantity: formatDuration(entry.duration),
        unitPrice: entry.hourlyRate || 100,
        total: formatDuration(entry.duration) * (entry.hourlyRate || 100),
      }));
      setLineItems(items);
    }
  }, [preselectedTimeEntries]);

  const fetchClientsAndProjects = async () => {
    setLoading(true);
    try {
      const [clientsRes, projectsRes] = await Promise.all([
        fetch("/api/clients"),
        fetch("/api/projects"),
      ]);
      
      if (clientsRes.ok) {
        const clientsData = await clientsRes.json();
        setClients(clientsData.clients || []);
      }
      
      if (projectsRes.ok) {
        const projectsData = await projectsRes.json();
        setProjects(projectsData.projects || []);
      }
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeEntries = async () => {
    try {
      const res = await fetch("/api/time-entries?unbilled=true");
      if (res.ok) {
        const data = await res.json();
        setTimeEntries(data.timeEntries || []);
      }
    } catch (err) {
      console.error("Failed to fetch time entries:", err);
    }
  };

  const invoice = useMemo(() => {
    const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;

    return {
      invoiceNumber,
      clientId: selectedClient?.id || "",
      projectId: selectedProject?.id || "",
      amount: total,
      status: "DRAFT" as const,
      dueDate: new Date(dueDate),
      lineItems,
    };
  }, [selectedClient, selectedProject, lineItems, taxRate, dueDate, invoiceNumber]);

  const availableTimeEntries = useMemo(() => {
    if (!selectedProject) return [];
    return timeEntries.filter(
      (entry) =>
        entry.projectId === selectedProject.id &&
        !lineItems.some((item) => item.id === entry.id) // Simplified check
    );
  }, [timeEntries, selectedProject, lineItems]);

  const addLineItem = () => {
    const newItem: InvoiceLineItem = {
      id: crypto.randomUUID(),
      description: "",
      quantity: 1,
      unitPrice: 100,
      total: 100,
    };
    setLineItems([...lineItems, newItem]);
  };

  const addTimeEntryAsLineItem = (entry: TimeEntry) => {
    const hours = formatDuration(entry.duration);
    const rate = entry.hourlyRate || 100;
    const newItem: InvoiceLineItem = {
      id: crypto.randomUUID(),
      description: entry.description || `${entry.projectName} - Work`,
      quantity: hours,
      unitPrice: rate,
      total: hours * rate,
    };
    setLineItems([...lineItems, newItem]);
    setShowTimeEntrySelector(false);
  };

  const updateLineItem = (id: string, updates: Partial<InvoiceLineItem>) => {
    setLineItems(
      lineItems.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, ...updates };
        updated.total = updated.quantity * updated.unitPrice;
        return updated;
      })
    );
  };

  const removeLineItem = (id: string) => {
    setLineItems(lineItems.filter((item) => item.id !== id));
  };

  const handleSubmit = async () => {
    if (!selectedClient || !selectedProject || lineItems.length === 0) return;
    
    setSubmitting(true);
    try {
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: selectedClient.id,
          projectId: selectedProject.id,
          amount: invoice.amount,
          status: "DRAFT",
          dueDate: dueDate,
          lineItems: lineItems.map(item => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total,
          })),
        }),
      });

      if (!response.ok) throw new Error("Failed to create invoice");
      
      onSuccess();
      resetForm();
      onClose();
    } catch (err) {
      console.error("Create invoice error:", err);
      alert("Failed to create invoice");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedClient(null);
    setSelectedProject(null);
    setLineItems([]);
    setTaxRate(21);
    setNotes("");
    setDueDate(defaultDueDate());
    setInvoiceNumber(generateInvoiceNumber());
  };

  const totalHours = lineItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white max-w-4xl w-full max-h-[90vh] overflow-auto border-2 border-black"
          style={{ boxShadow: "8px 8px 0 0 #000" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-black text-white p-4 border-b-2 border-black flex items-center justify-between z-10">
            <div className="flex items-center gap-4">
              <FileText className="w-6 h-6" />
              <h2 className="font-display text-xl font-bold tracking-tight">CREATE INVOICE</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 border-2 border-white hover:bg-white hover:text-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-4 border-black border-t-[#FF2E63] rounded-full animate-spin mx-auto mb-4" />
                <p className="font-mono text-sm">LOADING...</p>
              </div>
            ) : (
              <>
                {/* Invoice Number & Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="border-2 border-black bg-[#F5F5F0] p-4">
                    <div className="text-xs font-mono tracking-[0.2em] text-gray-500 mb-1">INVOICE NUMBER</div>
                    <input
                      type="text"
                      value={invoiceNumber}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                      className="w-full bg-transparent font-display text-lg font-bold outline-none"
                    />
                  </div>
                  <div className="border-2 border-black bg-[#F5F5F0] p-4">
                    <div className="text-xs font-mono tracking-[0.2em] text-gray-500 mb-1">DUE DATE</div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full bg-transparent font-display text-lg font-bold outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Client Selector */}
                <div>
                  <label className="block text-xs tracking-[0.2em] mb-2 uppercase font-mono font-bold">CLIENT *</label>
                  <button
                    onClick={() => setShowClientSelector(!showClientSelector)}
                    className="w-full border-2 border-black bg-[#F5F5F0] px-4 py-3 text-left flex items-center justify-between hover:bg-black hover:text-white transition-colors"
                  >
                    <span className={selectedClient ? "font-bold" : "text-gray-500"}>
                      {selectedClient ? selectedClient.name : "SELECT CLIENT"}
                    </span>
                    <motion.span animate={{ rotate: showClientSelector ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronDown className="w-5 h-5" />
                    </motion.span>
                  </button>

                  <AnimatePresence>
                    {showClientSelector && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-2 border-black border-t-0 bg-white overflow-hidden max-h-60 overflow-y-auto"
                      >
                        {clients.length === 0 ? (
                          <div className="p-4 text-center text-gray-500 font-mono text-sm">NO CLIENTS AVAILABLE</div>
                        ) : (
                          clients.map((client) => (
                            <button
                              key={client.id}
                              onClick={() => {
                                setSelectedClient(client);
                                setShowClientSelector(false);
                              }}
                              className="w-full px-4 py-3 text-left border-b border-black last:border-b-0 hover:bg-[#FF2E63] hover:text-white transition-colors"
                            >
                              <div className="font-bold">{client.name}</div>
                              <div className="text-xs font-mono opacity-70">{client.email} {client.company && `• ${client.company}`}</div>
                            </button>
                          ))
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Project Selector */}
                <div>
                  <label className="block text-xs tracking-[0.2em] mb-2 uppercase font-mono font-bold">PROJECT *</label>
                  <button
                    onClick={() => setShowProjectSelector(!showProjectSelector)}
                    className="w-full border-2 border-black bg-[#F5F5F0] px-4 py-3 text-left flex items-center justify-between hover:bg-black hover:text-white transition-colors"
                    disabled={!selectedClient}
                  >
                    <span className={selectedProject ? "font-bold" : "text-gray-500"}>
                      {selectedProject ? selectedProject.name : selectedClient ? "SELECT PROJECT" : "SELECT CLIENT FIRST"}
                    </span>
                    <motion.span animate={{ rotate: showProjectSelector ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronDown className="w-5 h-5" />
                    </motion.span>
                  </button>

                  <AnimatePresence>
                    {showProjectSelector && selectedClient && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-2 border-black border-t-0 bg-white overflow-hidden max-h-60 overflow-y-auto"
                      >
                        {projects.filter(p => p.clientId === selectedClient.id).length === 0 ? (
                          <div className="p-4 text-center text-gray-500 font-mono text-sm">NO PROJECTS FOR THIS CLIENT</div>
                        ) : (
                          projects
                            .filter(p => p.clientId === selectedClient.id)
                            .map((project) => (
                              <button
                                key={project.id}
                                onClick={() => {
                                  setSelectedProject(project);
                                  setShowProjectSelector(false);
                                }}
                                className="w-full px-4 py-3 text-left border-b border-black last:border-b-0 hover:bg-[#FF2E63] hover:text-white transition-colors"
                              >
                                <div className="font-bold">{project.name}</div>
                                <div className="text-xs font-mono opacity-70">{project.status}</div>
                              </button>
                            ))
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Add Line Items */}
                <div>
                  <label className="block text-xs tracking-[0.2em] mb-2 uppercase font-mono font-bold">LINE ITEMS</label>
                  <div className="flex gap-2 flex-wrap">
                    {selectedProject && availableTimeEntries.length > 0 && (
                      <button
                        onClick={() => setShowTimeEntrySelector(true)}
                        className="border-2 border-black bg-black text-white px-4 py-2 font-bold uppercase tracking-wider text-xs flex items-center gap-2 hover:bg-[#FF2E63] hover:border-[#FF2E63] transition-colors"
                      >
                        <Clock className="w-4 h-4" />
                        FROM TIME ({availableTimeEntries.length})
                      </button>
                    )}
                    <button
                      onClick={addLineItem}
                      className="border-2 border-black bg-white px-4 py-2 font-bold uppercase tracking-wider text-xs flex items-center gap-2 hover:bg-black hover:text-white transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      ADD LINE ITEM
                    </button>
                  </div>
                </div>

                {/* Time Entry Selector Modal */}
                <AnimatePresence>
                  {showTimeEntrySelector && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                      onClick={() => setShowTimeEntrySelector(false)}
                    >
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="border-2 border-black bg-white p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto"
                        style={{ boxShadow: "8px 8px 0 0 #000" }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-display text-xl font-bold">SELECT TIME ENTRIES</h4>
                          <button onClick={() => setShowTimeEntrySelector(false)} className="p-2 hover:bg-gray-100 border-2 border-black">
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        {availableTimeEntries.length === 0 ? (
                          <p className="text-center py-8 text-gray-500 font-mono text-sm">NO UNBILLED TIME ENTRIES</p>
                        ) : (
                          <div className="space-y-2">
                            {availableTimeEntries.map((entry) => (
                              <button
                                key={entry.id}
                                onClick={() => addTimeEntryAsLineItem(entry)}
                                className="w-full border-2 border-black p-3 text-left hover:bg-[#FF2E63] hover:text-white hover:border-[#FF2E63] transition-colors text-left"
                              >
                                <div className="font-bold">{entry.description || "Work"}</div>
                                <div className="flex items-center justify-between text-xs font-mono mt-1">
                                  <span>{formatDuration(entry.duration)} hrs</span>
                                  <span>{new Date(entry.startTime).toLocaleDateString()}</span>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Line Items Table */}
                {lineItems.length > 0 && (
                  <div className="border-2 border-black">
                    <table className="w-full">
                      <thead className="bg-black text-white">
                        <tr>
                          <th className="text-left p-3 text-xs font-mono">DESCRIPTION</th>
                          <th className="text-right p-3 text-xs font-mono">QTY</th>
                          <th className="text-right p-3 text-xs font-mono">RATE (€)</th>
                          <th className="text-right p-3 text-xs font-mono">AMOUNT</th>
                          <th className="p-3 w-12"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {lineItems.map((item, index) => (
                          <tr key={item.id} className={index % 2 === 1 ? "bg-[#F5F5F0]" : ""}>
                            <td className="p-3">
                              <input
                                type="text"
                                value={item.description}
                                onChange={(e) => updateLineItem(item.id, { description: e.target.value })}
                                className="w-full border-2 border-black bg-white px-2 py-1 text-sm outline-none focus:bg-black focus:text-white transition-colors font-mono"
                                placeholder="Description"
                              />
                            </td>
                            <td className="p-3">
                              <input
                                type="number"
                                step="0.1"
                                value={item.quantity}
                                onChange={(e) => updateLineItem(item.id, { quantity: parseFloat(e.target.value) || 0 })}
                                className="w-20 border-2 border-black bg-white px-2 py-1 text-sm outline-none focus:bg-black focus:text-white transition-colors font-mono text-right"
                              />
                            </td>
                            <td className="p-3">
                              <input
                                type="number"
                                value={item.unitPrice}
                                onChange={(e) => updateLineItem(item.id, { unitPrice: parseFloat(e.target.value) || 0 })}
                                className="w-24 border-2 border-black bg-white px-2 py-1 text-sm outline-none focus:bg-black focus:text-white transition-colors font-mono text-right"
                              />
                            </td>
                            <td className="p-3 text-right font-bold font-display">{formatCurrency(item.total)}</td>
                            <td className="p-3">
                              <button
                                onClick={() => removeLineItem(item.id)}
                                className="p-1 border-2 border-black hover:bg-[#FF2E63] hover:text-white hover:border-[#FF2E63] transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Tax Rate */}
                <div className="flex items-center justify-end gap-4">
                  <label className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider">
                    <Percent className="w-4 h-4" />
                    TAX RATE
                  </label>
                  <input
                    type="number"
                    value={taxRate}
                    onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                    className="w-20 border-2 border-black bg-white px-3 py-2 text-sm outline-none focus:bg-black focus:text-white transition-colors font-mono text-right"
                  />
                  <span className="text-sm font-bold">%</span>
                </div>

                {/* Summary */}
                <div className="border-2 border-black bg-[#F5F5F0] p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-mono text-sm">SUBTOTAL</span>
                    <span className="font-display text-lg font-bold">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-mono text-sm">TAX ({taxRate}%)</span>
                    <span className="font-display text-lg">{formatCurrency(taxAmount)}</span>
                  </div>
                  <div className="border-t-2 border-black pt-2 flex justify-between items-center">
                    <span className="font-mono text-sm font-bold">TOTAL</span>
                    <span className="font-display text-2xl font-bold text-[#FF2E63]">{formatCurrency(total)}</span>
                  </div>
                  {totalHours > 0 && (
                    <div className="text-xs font-mono text-gray-500 mt-2 text-right">
                      {totalHours.toFixed(1)} hours @ {formatCurrency(subtotal / totalHours)}/hr
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs tracking-[0.2em] mb-2 uppercase font-mono font-bold flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    NOTES / TERMS
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Payment terms, notes, or additional information..."
                    rows={3}
                    className="w-full border-2 border-black bg-[#F5F5F0] px-4 py-3 text-sm outline-none focus:bg-black focus:text-white transition-colors font-mono resize-none"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 sticky bottom-0 bg-white pt-4 border-t-2 border-black">
                  <motion.button
                    onClick={handleSubmit}
                    disabled={!selectedClient || !selectedProject || lineItems.length === 0 || submitting}
                    className="flex-1 border-2 border-black bg-black text-white px-6 py-4 font-bold uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#FF2E63] hover:border-[#FF2E63] transition-colors"
                    style={{ boxShadow: "4px 4px 0 0 #FF2E63" }}
                    whileHover={selectedClient && selectedProject && lineItems.length > 0 && !submitting ? { x: -2, y: -2, boxShadow: "6px 6px 0 0 #FF2E63" } : {}}
                    whileTap={selectedClient && selectedProject && lineItems.length > 0 && !submitting ? { x: 0, y: 0, boxShadow: "2px 2px 0 0 #FF2E63" } : {}}
                  >
                    {submitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        CREATING...
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5" />
                        CREATE INVOICE
                      </>
                    )}
                  </motion.button>
                  <button
                    onClick={onClose}
                    className="px-6 py-4 border-2 border-black bg-white font-bold uppercase tracking-wider hover:bg-black hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
