'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, X, Calendar, FileText, Clock, ChevronDown } from 'lucide-react';
import type { Client, Project } from '@/types';

interface TimeEntry {
  id: string;
  projectId: string;
  projectName: string;
  clientName: string;
  description: string;
  duration: number;
  billable: boolean;
  startTime: Date;
  hourlyRate?: number;
}

interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface InvoiceSettings {
  id: string;
  invoicePrefix: string;
  nextInvoiceNumber: number;
  isVatPayer: boolean;
  vatRate: number;
  defaultDueDays: number;
}

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  preselectedClientId?: string;
  preselectedProjectId?: string;
  preselectedTimeEntries?: TimeEntry[];
}

const today = () => new Date().toISOString().split('T')[0];
const defaultDueDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().split('T')[0];
};

const formatCurrency = (amount: number) => 
  new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(amount);

export default function CreateInvoiceModal({
  isOpen,
  onClose,
  onSuccess,
  preselectedClientId,
  preselectedProjectId,
  preselectedTimeEntries = [],
}: CreateInvoiceModalProps) {
  // Data
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [settings, setSettings] = useState<InvoiceSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Selection
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showClientSelector, setShowClientSelector] = useState(false);
  const [showProjectSelector, setShowProjectSelector] = useState(false);

  // Invoice data
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([]);
  const [taxRate, setTaxRate] = useState(21);
  const [invoiceDate, setInvoiceDate] = useState(today());
  const [dueDate, setDueDate] = useState(defaultDueDate());
  const [showDueDate, setShowDueDate] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [showTimeEntrySelector, setShowTimeEntrySelector] = useState(false);

  // Load all data
  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [clientsRes, projectsRes, timeRes, settingsRes, invoicesRes] = await Promise.all([
        fetch('/api/clients'),
        fetch('/api/projects'),
        fetch('/api/time-entries'),
        fetch('/api/invoices/settings'),
        fetch('/api/invoices'),
      ]);

      if (clientsRes.ok) {
        const data = await clientsRes.json();
        setClients(data.clients || []);
      }
      if (projectsRes.ok) {
        const data = await projectsRes.json();
        setProjects(data.projects || []);
      }
      if (timeRes.ok) {
        const data = await timeRes.json();
        setTimeEntries(data.entries || []);
      }
      if (settingsRes.ok) {
        const data = await settingsRes.json();
        setSettings(data.settings);
        
        // Calculate next invoice number from existing invoices
        const prefix = data.settings?.invoicePrefix || 'CM';
        let maxNum = 0;
        
        if (invoicesRes.ok) {
          const invoicesData = await invoicesRes.json();
          const existingInvoices = invoicesData.invoices || [];
          
          for (const inv of existingInvoices) {
            if (inv.invoiceNumber) {
              const match = inv.invoiceNumber.match(new RegExp(`^${prefix}-(\\d+)$`));
              if (match) {
                const num = parseInt(match[1], 10);
                if (num > maxNum) maxNum = num;
              }
            }
          }
        }
        
        const nextNum = maxNum + 1;
        setInvoiceNumber(`${prefix}-${String(nextNum).padStart(4, '0')}`);
        
        // Set tax rate based on VAT payer status
        if (data.settings) {
          setTaxRate(data.settings.isVatPayer ? data.settings.vatRate : 0);
        }
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Preselect
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
      const items: InvoiceLineItem[] = preselectedTimeEntries.map(entry => {
        const hours = Math.round((entry.duration / 3600) * 10) / 10;
        const rate = entry.hourlyRate || 100;
        return {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${entry.id.slice(0, 5)}`,
          description: entry.description || `${entry.projectName} - Work`,
          quantity: hours,
          unitPrice: rate,
          total: Math.round(hours * rate * 100) / 100,
        };
      });
      setLineItems(items);
    }
  }, [preselectedTimeEntries]);

  // Line item functions
  const handleAddLineItem = () => {
    const newItem: InvoiceLineItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      description: '',
      quantity: 1,
      unitPrice: 100,
      total: 100,
    };
    setLineItems(prev => [...prev, newItem]);
  };

  const updateLineItem = (id: string, updates: Partial<InvoiceLineItem>) => {
    setLineItems(prev =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, ...updates };
        updated.total = Math.round(updated.quantity * updated.unitPrice * 100) / 100;
        return updated;
      })
    );
  };

  const removeLineItem = (id: string) => {
    setLineItems(prev => prev.filter(item => item.id !== id));
  };

  // Calculations
  const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;
  const totalHours = lineItems.reduce((sum, item) => sum + item.quantity, 0);

  // Time entries
  const getAvailableTimeEntries = () => {
    return timeEntries.filter(
      (entry) =>
        entry.billable &&
        (!selectedClient || entry.clientName === selectedClient.name) &&
        (!selectedProject || entry.projectName === selectedProject.name)
    );
  };

  const addTimeEntry = (entry: TimeEntry) => {
    const hours = Math.round((entry.duration / 3600) * 10) / 10;
    const rate = entry.hourlyRate || 100;
    const newItem: InvoiceLineItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      description: entry.description || 'Work',
      quantity: hours,
      unitPrice: rate,
      total: Math.round(hours * rate * 100) / 100,
    };
    setLineItems(prev => [...prev, newItem]);
    setShowTimeEntrySelector(false);
  };

  // Submit
  const handleSubmit = async () => {
    if (!selectedClient || !selectedProject || lineItems.length === 0) return;

    setSubmitting(true);
    try {
      const body: any = {
        clientId: selectedClient.id,
        projectId: selectedProject.id,
        amount: total,
        status: 'DRAFT',
        invoiceNumber,
        invoiceDate,
        lineItems: lineItems.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total,
        })),
      };

      if (showDueDate && dueDate) {
        body.dueDate = dueDate;
      }

      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error('Failed to create invoice');

      onSuccess();
      resetForm();
      onClose();
    } catch (err) {
      console.error('Create invoice error:', err);
      alert('Failed to create invoice');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedClient(null);
    setSelectedProject(null);
    setLineItems([]);
    setTaxRate(settings?.isVatPayer ? settings.vatRate : 0);
    setInvoiceDate(today());
    setDueDate(defaultDueDate());
    setShowDueDate(false);
    
    // Increment invoice number for next time
    if (settings && invoiceNumber) {
      const prefix = settings.invoicePrefix || 'CM';
      const match = invoiceNumber.match(new RegExp(`^${prefix}-(\\d+)$`));
      if (match) {
        const currentNum = parseInt(match[1], 10);
        setInvoiceNumber(`${prefix}-${String(currentNum + 1).padStart(4, '0')}`);
      }
    }
  };

  const handleClose = () => {
    if (!submitting) {
      resetForm();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-black/50 z-50"
        />

        {/* Modal */}
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50 overflow-hidden">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl max-h-[85vh] bg-[#141414] border border-white/10 overflow-hidden rounded-md flex flex-col"
          >
            {/* Header */}
            <div className="border-b border-white/10 p-3 bg-[#0a0a0a] flex-shrink-0">
              <div className="flex items-center justify-between">
                <h2 className="text-white font-display font-bold tracking-wider uppercase text-sm">Create Invoice</h2>
                <button
                  onClick={handleClose}
                  disabled={submitting}
                  className="p-1 text-white/60 hover:text-[#ff006e] transition-colors disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="w-6 h-6 border-2 border-[#ff006e] border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
              ) : (
                <>
                  {/* Invoice Number & Date */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#0a0a0a] border border-white/10 p-3 rounded">
                      <div className="text-[10px] font-mono text-white/50 uppercase tracking-wider mb-1">Invoice Number</div>
                      <input
                        type="text"
                        value={invoiceNumber}
                        onChange={(e) => setInvoiceNumber(e.target.value)}
                        className="w-full bg-transparent font-mono text-sm font-bold text-white outline-none"
                      />
                    </div>
                    <div className="bg-[#0a0a0a] border border-white/10 p-3 rounded">
                      <div className="text-[10px] font-mono text-white/50 uppercase tracking-wider mb-1">Invoice Date</div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3 text-white/50" />
                        <input
                          type="date"
                          value={invoiceDate}
                          onChange={(e) => setInvoiceDate(e.target.value)}
                          className="w-full bg-transparent font-mono text-sm text-white outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Due Date Toggle */}
                  <div className="flex items-center gap-3 bg-[#0a0a0a] border border-white/10 p-3 rounded">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showDueDate}
                        onChange={(e) => setShowDueDate(e.target.checked)}
                        className="w-4 h-4 accent-[#ff006e]"
                      />
                      <span className="text-xs text-white/70">Show Due Date</span>
                    </label>
                    {showDueDate && (
                      <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="ml-auto bg-[#141414] text-white font-mono text-xs border border-white/10 outline-none px-2 py-1 rounded"
                      />
                    )}
                  </div>

                  {/* Client & Project */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Client */}
                    <div className="relative">
                      <label className="block text-[10px] font-mono text-white/50 uppercase tracking-wider mb-1">Client *</label>
                      <button
                        onClick={() => setShowClientSelector(!showClientSelector)}
                        className={`w-full border px-3 py-2 text-left flex items-center justify-between text-xs rounded ${
                          selectedClient
                            ? 'bg-[#ff006e]/10 border-[#ff006e]/30 text-white'
                            : 'bg-[#0a0a0a] border-white/10 text-white/60'
                        }`}
                      >
                        <span className={selectedClient ? 'font-bold' : ''}>
                          {selectedClient ? selectedClient.name : 'Select...'}
                        </span>
                        <ChevronDown className="w-3 h-3" />
                      </button>
                      <AnimatePresence>
                        {showClientSelector && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="absolute z-20 left-0 right-0 mt-1 border border-white/10 bg-[#0a0a0a] overflow-hidden rounded max-h-40 overflow-y-auto"
                          >
                            {clients.map((client) => (
                              <button
                                key={client.id}
                                onClick={() => {
                                  setSelectedClient(client);
                                  setShowClientSelector(false);
                                }}
                                className="w-full px-3 py-2 text-left border-b border-white/10 last:border-b-0 hover:bg-white/5 text-xs text-white"
                              >
                                <div className="font-bold">{client.name}</div>
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Project */}
                    <div className="relative">
                      <label className="block text-[10px] font-mono text-white/50 uppercase tracking-wider mb-1">Project *</label>
                      <button
                        onClick={() => setShowProjectSelector(!showProjectSelector)}
                        className={`w-full border px-3 py-2 text-left flex items-center justify-between text-xs rounded ${
                          selectedProject
                            ? 'bg-[#ff006e]/10 border-[#ff006e]/30 text-white'
                            : 'bg-[#0a0a0a] border-white/10 text-white/60'
                        }`}
                      >
                        <span className={selectedProject ? 'font-bold' : ''}>
                          {selectedProject ? selectedProject.name : 'Select...'}
                        </span>
                        <ChevronDown className="w-3 h-3" />
                      </button>
                      <AnimatePresence>
                        {showProjectSelector && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="absolute z-20 left-0 right-0 mt-1 border border-white/10 bg-[#0a0a0a] overflow-hidden rounded max-h-40 overflow-y-auto"
                          >
                            {projects
                              .filter(p => !selectedClient || p.clientId === selectedClient.id)
                              .map((project) => (
                                <button
                                  key={project.id}
                                  onClick={() => {
                                    setSelectedProject(project);
                                    setShowProjectSelector(false);
                                  }}
                                  className="w-full px-3 py-2 text-left border-b border-white/10 last:border-b-0 hover:bg-white/5 text-xs text-white"
                                >
                                  <div className="font-bold">{project.name}</div>
                                </button>
                              ))}
                          </motion.div>
                        )}
      </AnimatePresence>
                    </div>
                  </div>

                  {/* Time Entries */}
                  {selectedClient && selectedProject && getAvailableTimeEntries().length > 0 && (
                    <div className="bg-[#0a0a0a] border border-white/10 p-3 rounded">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3 text-[#ff006e]" />
                          <span className="text-xs text-white/60">{getAvailableTimeEntries().length} unbilled entries</span>
                        </div>
                        <button
                          onClick={() => setShowTimeEntrySelector(!showTimeEntrySelector)}
                          className="text-xs text-[#ff006e] hover:text-white"
                        >
                          {showTimeEntrySelector ? 'Hide' : 'Add'}
                        </button>
                      </div>
                      <AnimatePresence>
                        {showTimeEntrySelector && (
                          <motion.div className="space-y-1">
                            {getAvailableTimeEntries().map((entry) => (
                              <div key={entry.id} className="flex items-center justify-between p-2 border border-white/10 rounded">
                                <div className="text-xs">
                                  <div className="text-white">{entry.description || 'Work'}</div>
                                  <div className="text-white/50 font-mono">{Math.round((entry.duration / 3600) * 10) / 10}h</div>
                                </div>
                                <button
                                  onClick={() => addTimeEntry(entry)}
                                  className="px-2 py-1 bg-[#ff006e] text-white text-[10px] font-bold rounded hover:bg-[#ff006e]/80"
                                >
                                  ADD
                                </button>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Line Items */}
                  <div className="bg-[#0a0a0a] border border-white/10 rounded overflow-hidden">
                    <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
                      <h3 className="font-bold text-xs text-white flex items-center gap-2">
                        <FileText className="w-3 h-3" />
                        Line Items ({lineItems.length})
                      </h3>
                      <span className="text-xs text-white/60 font-mono">{totalHours.toFixed(1)}h • {formatCurrency(subtotal)}</span>
                    </div>

                    <div className="p-3 space-y-2">
                      {lineItems.map((item) => (
                        <div key={item.id} className="grid grid-cols-12 gap-2 items-center text-xs">
                          <div className="col-span-5">
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => updateLineItem(item.id, { description: e.target.value })}
                              placeholder="Description"
                              className="w-full bg-[#141414] text-white border border-white/10 px-2 py-1.5 rounded outline-none focus:border-[#ff006e]"
                            />
                          </div>
                          <div className="col-span-2">
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateLineItem(item.id, { quantity: parseFloat(e.target.value) || 0 })}
                              step="0.1"
                              className="w-full bg-[#141414] text-white border border-white/10 px-2 py-1.5 text-center rounded outline-none focus:border-[#ff006e]"
                            />
                          </div>
                          <div className="col-span-2">
                            <input
                              type="number"
                              value={item.unitPrice}
                              onChange={(e) => updateLineItem(item.id, { unitPrice: parseFloat(e.target.value) || 0 })}
                              className="w-full bg-[#141414] text-white border border-white/10 px-2 py-1.5 text-center rounded outline-none focus:border-[#ff006e]"
                            />
                          </div>
                          <div className="col-span-2 text-right font-mono text-white/70">
                            {formatCurrency(item.total)}
                          </div>
                          <div className="col-span-1">
                            <button
                              onClick={() => removeLineItem(item.id)}
                              className="w-full py-1.5 text-red-500 hover:text-red-400 flex items-center justify-center"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* Add Button */}
                      <button
                        type="button"
                        onClick={handleAddLineItem}
                        className="w-full py-2 border border-dashed border-white/20 text-white/50 hover:text-[#ff006e] hover:border-[#ff006e]/50 flex items-center justify-center gap-1 text-xs transition-colors rounded"
                      >
                        <Plus className="w-3 h-3" />
                        Add Line Item
                      </button>
                    </div>

                    {/* Totals */}
                    <div className="border-t border-white/10 px-3 py-2 space-y-1 text-xs">
                      <div className="flex justify-between text-white/60">
                        <span>Subtotal</span>
                        <span className="font-mono text-white">{formatCurrency(subtotal)}</span>
                      </div>
                      {settings?.isVatPayer && (
                        <div className="flex justify-between">
                          <div className="flex items-center gap-1">
                            <span className="text-white/60">Tax ({settings.vatRate}%)</span>
                          </div>
                          <span className="font-mono text-white">{formatCurrency(taxAmount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold pt-1 border-t border-white/10">
                        <span className="text-white">Total</span>
                        <span className="font-mono text-[#ff006e]">{formatCurrency(total)}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-white/10 p-3 bg-[#0a0a0a] flex-shrink-0">
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleClose}
                  disabled={submitting}
                  className="px-4 py-2 bg-transparent border border-white/20 text-white text-xs font-mono uppercase tracking-wider hover:border-white/40 transition-colors disabled:opacity-50 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !selectedClient || !selectedProject || lineItems.length === 0}
                  className="px-4 py-2 bg-[#ff006e] text-white text-xs font-mono uppercase tracking-wider font-bold hover:bg-[#ff006e]/80 transition-colors disabled:opacity-50 rounded"
                >
                  {submitting ? 'Creating...' : 'Create'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </>
    </AnimatePresence>
  );
}
