"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, FileText, Calendar, DollarSign, Percent, X, Check, ChevronDown } from "lucide-react";

interface Project {
  id: string;
  name: string;
  client: string;
  clientEmail?: string;
  clientAddress?: string;
}

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

interface InvoiceLineItem {
  id: string;
  description: string;
  hours: number;
  rate: number;
  amount: number;
  type: "time" | "fixed";
  timeEntryId?: string;
}

interface Invoice {
  id: string;
  number: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  projectId: string;
  projectName: string;
  date: string;
  dueDate: string;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  status: "draft" | "sent" | "paid" | "overdue";
  notes: string;
}

interface InvoiceFormProps {
  projects: Project[];
  timeEntries: TimeEntry[];
  onSubmit: (invoice: Invoice) => void;
  onCancel?: () => void;
  defaultHourlyRate?: number;
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
const dueDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toISOString().split("T")[0];
};

export default function InvoiceForm({ projects, timeEntries, onSubmit, onCancel, defaultHourlyRate = 100 }: InvoiceFormProps) {
  const [selectedClient, setSelectedClient] = useState<Project | null>(null);
  const [showClientSelector, setShowClientSelector] = useState(false);
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([]);
  const [taxRate, setTaxRate] = useState(21);
  const [notes, setNotes] = useState("");
  const [showTimeEntrySelector, setShowTimeEntrySelector] = useState(false);

  const invoice = useMemo(() => {
    const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;

    return {
      id: crypto.randomUUID(),
      number: generateInvoiceNumber(),
      clientName: selectedClient?.client || "",
      clientEmail: selectedClient?.clientEmail || "",
      clientAddress: selectedClient?.clientAddress || "",
      projectId: selectedClient?.id || "",
      projectName: selectedClient?.name || "",
      date: today(),
      dueDate: dueDate(),
      lineItems,
      subtotal,
      taxRate,
      taxAmount,
      total,
      status: "draft" as const,
      notes,
    };
  }, [selectedClient, lineItems, taxRate, notes]);

  const availableTimeEntries = useMemo(() => {
    if (!selectedClient) return [];
    return timeEntries.filter(
      (entry) =>
        entry.projectId === selectedClient.id &&
        entry.billable &&
        !lineItems.some((item) => item.timeEntryId === entry.id)
    );
  }, [timeEntries, selectedClient, lineItems]);

  const addLineItem = (type: "time" | "fixed") => {
    const newItem: InvoiceLineItem = {
      id: crypto.randomUUID(),
      description: type === "fixed" ? "" : "Development work",
      hours: type === "fixed" ? 0 : 1,
      rate: defaultHourlyRate,
      amount: type === "fixed" ? 0 : defaultHourlyRate,
      type,
    };
    setLineItems([...lineItems, newItem]);
  };

  const addTimeEntryAsLineItem = (entry: TimeEntry) => {
    const hours = formatDuration(entry.duration);
    const newItem: InvoiceLineItem = {
      id: crypto.randomUUID(),
      description: entry.description || `${entry.projectName} - Development`,
      hours,
      rate: defaultHourlyRate,
      amount: hours * defaultHourlyRate,
      type: "time",
      timeEntryId: entry.id,
    };
    setLineItems([...lineItems, newItem]);
    setShowTimeEntrySelector(false);
  };

  const updateLineItem = (id: string, updates: Partial<InvoiceLineItem>) => {
    setLineItems(
      lineItems.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, ...updates };
        if (updated.type === "time") {
          updated.amount = updated.hours * updated.rate;
        }
        return updated;
      })
    );
  };

  const removeLineItem = (id: string) => {
    setLineItems(lineItems.filter((item) => item.id !== id));
  };

  const selectClient = (client: Project) => {
    setSelectedClient(client);
    setShowClientSelector(false);
  };

  const handleSubmit = () => {
    if (!selectedClient || lineItems.length === 0) return;
    onSubmit(invoice);
  };

  return (
    <div className="border-2 border-black bg-white" style={{ boxShadow: "8px 8px 0 0 #000" }}>
      {/* Header */}
      <div className="border-b-2 border-black bg-black text-white p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl font-bold tracking-tight">CREATE INVOICE</h3>
          <span className="mono text-xs tracking-[0.2em] text-[#FF2E63]">[BILLING]</span>
        </div>
      </div>

      <div className="p-6">
        {/* Invoice Number & Date */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="border-2 border-black bg-[#F5F5F0] p-4">
            <div className="text-xs mono tracking-[0.2em] text-gray-500 mb-1">INVOICE NUMBER</div>
            <div className="font-display text-lg font-bold">{invoice.number}</div>
          </div>
          <div className="border-2 border-black bg-[#F5F5F0] p-4">
            <div className="text-xs mono tracking-[0.2em] text-gray-500 mb-1">DATE</div>
            <div className="font-display text-lg font-bold flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {invoice.date}
            </div>
          </div>
        </div>

        {/* Client Selector */}
        <div className="mb-6">
          <label className="block text-xs tracking-[0.2em] mb-2 uppercase mono">CLIENT & PROJECT *</label>
          <button
            onClick={() => setShowClientSelector(!showClientSelector)}
            className="w-full border-2 border-black bg-[#F5F5F0] px-4 py-3 text-left flex items-center justify-between hover:bg-black hover:text-white transition-colors"
          >
            <span className={selectedClient ? "font-bold" : "text-gray-500"}>
              {selectedClient ? `${selectedClient.client} — ${selectedClient.name}` : "SELECT CLIENT & PROJECT"}
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
                className="border-2 border-black border-t-0 bg-white overflow-hidden"
              >
                {projects.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 mono text-sm">NO PROJECTS AVAILABLE</div>
                ) : (
                  projects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => selectClient(project)}
                      className="w-full px-4 py-3 text-left border-b border-black last:border-b-0 hover:bg-[#FF2E63] hover:text-white transition-colors"
                    >
                      <div className="font-bold">{project.client}</div>
                      <div className="text-xs mono opacity-70">{project.name}</div>
                    </button>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Client Details */}
        {selectedClient && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-6 border-2 border-black p-4 bg-[#F5F5F0]"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs tracking-[0.2em] mb-1 uppercase mono text-gray-500">CLIENT EMAIL</label>
                <input
                  type="email"
                  value={selectedClient.clientEmail || ""}
                  onChange={(e) => setSelectedClient({ ...selectedClient, clientEmail: e.target.value })}
                  placeholder="client@email.com"
                  className="w-full border-2 border-black bg-white px-3 py-2 text-sm outline-none focus:bg-black focus:text-white transition-colors mono"
                />
              </div>
              <div>
                <label className="block text-xs tracking-[0.2em] mb-1 uppercase mono text-gray-500">DUE DATE</label>
                <input
                  type="date"
                  value={invoice.dueDate}
                  onChange={(e) => {}}
                  className="w-full border-2 border-black bg-white px-3 py-2 text-sm outline-none focus:bg-black focus:text-white transition-colors mono"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-xs tracking-[0.2em] mb-1 uppercase mono text-gray-500">BILLING ADDRESS</label>
              <textarea
                value={selectedClient.clientAddress || ""}
                onChange={(e) => setSelectedClient({ ...selectedClient, clientAddress: e.target.value })}
                placeholder="Client billing address..."
                rows={2}
                className="w-full border-2 border-black bg-white px-3 py-2 text-sm outline-none focus:bg-black focus:text-white transition-colors mono resize-none"
              />
            </div>
          </motion.div>
        )}

        {/* Add Line Items */}
        <div className="mb-4">
          <label className="block text-xs tracking-[0.2em] mb-2 uppercase mono">LINE ITEMS</label>
          <div className="flex gap-2">
            {selectedClient && availableTimeEntries.length > 0 && (
              <motion.button
                onClick={() => setShowTimeEntrySelector(true)}
                className="border-2 border-black bg-black text-white px-4 py-2 font-bold uppercase tracking-wider text-xs flex items-center gap-2"
                whileHover={{ backgroundColor: "#FF2E63", borderColor: "#FF2E63" }}
              >
                <Plus className="w-4 h-4" />
                FROM TIME ENTRIES ({availableTimeEntries.length})
              </motion.button>
            )}
            <motion.button
              onClick={() => addLineItem("time")}
              className="border-2 border-black bg-white px-4 py-2 font-bold uppercase tracking-wider text-xs flex items-center gap-2"
              whileHover={{ backgroundColor: "#000", color: "#fff" }}
            >
              <Plus className="w-4 h-4" />
              HOURLY ITEM
            </motion.button>
            <motion.button
              onClick={() => addLineItem("fixed")}
              className="border-2 border-black bg-white px-4 py-2 font-bold uppercase tracking-wider text-xs flex items-center gap-2"
              whileHover={{ backgroundColor: "#000", color: "#fff" }}
            >
              <Plus className="w-4 h-4" />
              FIXED COST
            </motion.button>
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
                  <button onClick={() => setShowTimeEntrySelector(false)} className="p-2 hover:bg-gray-100">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {availableTimeEntries.length === 0 ? (
                  <p className="text-center py-8 text-gray-500 mono text-sm">NO BILLABLE TIME ENTRIES AVAILABLE</p>
                ) : (
                  <div className="space-y-2">
                    {availableTimeEntries.map((entry) => (
                      <button
                        key={entry.id}
                        onClick={() => addTimeEntryAsLineItem(entry)}
                        className="w-full border-2 border-black p-3 text-left hover:bg-[#FF2E63] hover:text-white hover:border-[#FF2E63] transition-colors"
                      >
                        <div className="font-bold">{entry.description || "Development work"}</div>
                        <div className="flex items-center justify-between text-xs mono mt-1">
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
          <div className="border-2 border-black mb-6">
            <table className="w-full">
              <thead className="bg-black text-white">
                <tr>
                  <th className="text-left p-3 text-xs mono">DESCRIPTION</th>
                  <th className="text-right p-3 text-xs mono">HOURS/QTY</th>
                  <th className="text-right p-3 text-xs mono">RATE</th>
                  <th className="text-right p-3 text-xs mono">AMOUNT</th>
                  <th className="p-3"></th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item, index) => (
                  <tr key={item.id} className={index % 2 === 1 ? "bg-gray-50" : ""}>
                    <td className="p-3">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateLineItem(item.id, { description: e.target.value })}
                        className="w-full border-2 border-black bg-white px-2 py-1 text-sm outline-none focus:bg-black focus:text-white transition-colors mono"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        step="0.1"
                        value={item.hours}
                        onChange={(e) => updateLineItem(item.id, { hours: parseFloat(e.target.value) || 0 })}
                        className="w-20 border-2 border-black bg-white px-2 py-1 text-sm outline-none focus:bg-black focus:text-white transition-colors mono text-right"
                      />
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-end">
                        <span className="mr-1">€</span>
                        <input
                          type="number"
                          value={item.rate}
                          onChange={(e) => updateLineItem(item.id, { rate: parseFloat(e.target.value) || 0 })}
                          className="w-24 border-2 border-black bg-white px-2 py-1 text-sm outline-none focus:bg-black focus:text-white transition-colors mono text-right"
                        />
                      </div>
                    </td>
                    <td className="p-3 text-right font-bold">{formatCurrency(item.amount)}</td>
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
        <div className="flex items-center justify-end gap-4 mb-4">
          <label className="flex items-center gap-2 text-xs mono uppercase tracking-wider">
            <Percent className="w-4 h-4" />
            TAX RATE
          </label>
          <input
            type="number"
            value={taxRate}
            onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
            className="w-20 border-2 border-black bg-white px-3 py-2 text-sm outline-none focus:bg-black focus:text-white transition-colors mono text-right"
          />
          <span className="text-sm font-bold">%</span>
        </div>

        {/* Summary */}
        <div className="border-2 border-black bg-[#F5F5F0] p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="mono text-sm">SUBTOTAL</span>
            <span className="font-display text-lg font-bold">{formatCurrency(invoice.subtotal)}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="mono text-sm">TAX ({taxRate}%)</span>
            <span className="font-display text-lg">{formatCurrency(invoice.taxAmount)}</span>
          </div>
          <div className="border-t-2 border-black pt-2 flex justify-between items-center">
            <span className="mono text-sm font-bold">TOTAL</span>
            <span className="font-display text-2xl font-bold text-[#FF2E63]">{formatCurrency(invoice.total)}</span>
          </div>
        </div>

        {/* Notes */}
        <div className="mb-6">
          <label className="block text-xs tracking-[0.2em] mb-2 uppercase mono flex items-center gap-2">
            <FileText className="w-4 h-4" />
            NOTES / TERMS
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Payment terms, notes, or additional information..."
            rows={3}
            className="w-full border-2 border-black bg-[#F5F5F0] px-4 py-3 text-sm outline-none focus:bg-black focus:text-white transition-colors mono resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <motion.button
            onClick={handleSubmit}
            disabled={!selectedClient || lineItems.length === 0}
            className="flex-1 border-2 border-black bg-black text-white px-6 py-4 font-bold uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ boxShadow: "4px 4px 0 0 #FF2E63" }}
            whileHover={selectedClient && lineItems.length > 0 ? { x: -2, y: -2, boxShadow: "6px 6px 0 0 #FF2E63" } : {}}
            whileTap={selectedClient && lineItems.length > 0 ? { x: 0, y: 0, boxShadow: "2px 2px 0 0 #FF2E63" } : {}}
          >
            <Check className="w-5 h-5" />
            CREATE INVOICE
          </motion.button>
          {onCancel && (
            <motion.button
              onClick={onCancel}
              className="px-6 py-4 border-2 border-black bg-white font-bold uppercase tracking-wider"
              whileHover={{ backgroundColor: "#000", color: "#fff" }}
            >
              <X className="w-5 h-5" />
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}

