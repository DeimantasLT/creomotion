"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, FileText, Plus, X, ChevronLeft, DollarSign, BarChart3 } from "lucide-react";
import Link from "next/link";

import Timer from "@/components/timetracking/Timer";
import TimeEntryList from "@/components/timetracking/TimeEntryList";
import InvoiceForm from "@/components/invoicing/InvoiceForm";
import InvoicePDF, { InvoiceListItem, InvoiceStatusBadge } from "@/components/invoicing/InvoicePDF";

import { TimeEntry, Invoice, Project } from "@/types/time-tracking";

// Mock data for demonstration
const mockProjects: Project[] = [
  { id: "1", name: "LRT Žinių Rebrand", client: "LRT", clientEmail: "producer@lrt.lt", clientAddress: "Konarskio g. 49, Vilnius" },
  { id: "2", name: "Startup Promo Video", client: "TechFlow", clientEmail: "contact@techflow.io", clientAddress: "123 Startup Lane, Dublin" },
  { id: "3", name: "Documentary Graphics", client: "PC Lietuva", clientEmail: "docs@pclietuva.lt", clientAddress: "Gedimino pr. 12, Vilnius" },
  { id: "4", name: "AI Product Demo", client: "NeuroLab", clientEmail: "hello@neurolab.ai", clientAddress: "456 AI Boulevard, Berlin" },
];

const mockTimeEntries: TimeEntry[] = [
  {
    id: "1",
    projectId: "1",
    projectName: "LRT Žinių Rebrand",
    clientName: "LRT",
    description: "Logo animation concepts",
    duration: 7200,
    billable: true,
    startTime: new Date(Date.now() - 86400000),
    endTime: new Date(Date.now() - 86400000 + 7200000),
  },
  {
    id: "2",
    projectId: "1",
    projectName: "LRT Žinių Rebrand",
    clientName: "LRT",
    description: "Motion guidelines research",
    duration: 3600,
    billable: true,
    startTime: new Date(Date.now() - 90000000),
    endTime: new Date(Date.now() - 90000000 + 3600000),
  },
  {
    id: "3",
    projectId: "2",
    projectName: "Startup Promo Video",
    clientName: "TechFlow",
    description: "Storyboard review",
    duration: 5400,
    billable: false,
    startTime: new Date(Date.now() - 172800000),
    endTime: new Date(Date.now() - 172800000 + 5400000),
  },
  {
    id: "4",
    projectId: "3",
    projectName: "Documentary Graphics",
    clientName: "PC Lietuva",
    description: "Lower thirds design",
    duration: 10800,
    billable: true,
    startTime: new Date(Date.now() - 259200000),
    endTime: new Date(Date.now() - 259200000 + 10800000),
  },
];

const mockInvoices: Invoice[] = [
  {
    id: "1",
    number: "INV-2026-02-001",
    clientName: "LRT",
    clientEmail: "producer@lrt.lt",
    clientAddress: "Konarskio g. 49, Vilnius",
    projectId: "1",
    projectName: "LRT Žinių Rebrand",
    date: "2026-02-01",
    dueDate: "2026-02-15",
    lineItems: [
      { id: "1", description: "Logo animation", hours: 10, rate: 100, amount: 1000, type: "time" },
      { id: "2", description: "Motion research", hours: 5, rate: 100, amount: 500, type: "time" },
    ],
    subtotal: 1500,
    taxRate: 21,
    taxAmount: 315,
    total: 1815,
    status: "paid",
    notes: "Net 14 payment terms",
  },
  {
    id: "2",
    number: "INV-2026-02-002",
    clientName: "TechFlow",
    clientEmail: "contact@techflow.io",
    clientAddress: "123 Startup Lane, Dublin",
    projectId: "2",
    projectName: "Startup Promo Video",
    date: "2026-02-05",
    dueDate: "2026-02-19",
    lineItems: [
      { id: "3", description: "Promo video production", hours: 20, rate: 120, amount: 2400, type: "time" },
    ],
    subtotal: 2400,
    taxRate: 21,
    taxAmount: 504,
    total: 2904,
    status: "sent",
    notes: "Payment due within 14 days",
  },
  {
    id: "3",
    number: "INV-2026-01-015",
    clientName: "PC Lietuva",
    clientEmail: "docs@pclietuva.lt",
    clientAddress: "Gedimino pr. 12, Vilnius",
    projectId: "3",
    projectName: "Documentary Graphics",
    date: "2026-01-15",
    dueDate: "2026-01-29",
    lineItems: [
      { id: "4", description: "Graphics package", hours: 15, rate: 100, amount: 1500, type: "time" },
    ],
    subtotal: 1500,
    taxRate: 21,
    taxAmount: 315,
    total: 1815,
    status: "overdue",
    notes: "URGENT: Payment overdue",
  },
];

type Tab = "timer" | "entries" | "invoices" | "create-invoice";

export default function TimeInvoicingPage() {
  const [activeTab, setActiveTab] = useState<Tab>("timer");
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>(mockTimeEntries);
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showInvoicePreview, setShowInvoicePreview] = useState(false);

  const handleEntryComplete = useCallback((entry: TimeEntry) => {
    setTimeEntries((prev) => [entry, ...prev]);
  }, []);

  const handleEditEntry = useCallback((entry: TimeEntry) => {
    setTimeEntries((prev) =>
      prev.map((e) => (e.id === entry.id ? entry : e))
    );
  }, []);

  const handleDeleteEntry = useCallback((id: string) => {
    setTimeEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const handleToggleBillable = useCallback((id: string) => {
    setTimeEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, billable: !e.billable } : e))
    );
  }, []);

  const handleCreateInvoice = useCallback((invoice: Invoice) => {
    setInvoices((prev) => [invoice, ...prev]);
    setActiveTab("invoices");
  }, []);

  const handleUpdateInvoiceStatus = useCallback((id: string, status: Invoice["status"]) => {
    setInvoices((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status } : i))
    );
  }, []);

  // Calculate stats
  const totalHours = timeEntries.reduce((sum, e) => sum + e.duration, 0) / 3600;
  const billableHours = timeEntries.filter((e) => e.billable).reduce((sum, e) => sum + e.duration, 0) / 3600;
  const totalOutstanding = invoices.filter((i) => i.status === "sent" || i.status === "overdue").reduce((sum, i) => sum + i.total, 0);
  const totalPaid = invoices.filter((i) => i.status === "paid").reduce((sum, i) => sum + i.total, 0);

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 border-r-2 border-black bg-white p-6">
        <div className="mb-8">
          <Link href="/admin" className="block">
            <h1 className="font-display text-2xl font-bold">
              CREO<span className="text-[#FF2E63]">ADMIN</span>
            </h1>
          </Link>
          <p className="text-sm text-gray-500 mono mt-1">TIME & BILLING</p>
        </div>

        <nav className="space-y-2">
          {[
            { id: "timer", label: "Timer", icon: Clock },
            { id: "entries", label: "Time Entries", icon: BarChart3 },
            { id: "invoices", label: "Invoices", icon: FileText },
            { id: "create-invoice", label: "Create Invoice", icon: Plus },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as Tab);
                setSelectedInvoice(null);
                setShowInvoicePreview(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 font-mono text-sm border-2 border-black transition-colors ${
                activeTab === item.id
                  ? "bg-black text-white"
                  : "hover:bg-black hover:text-white"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label.toUpperCase()}
            </button>
          ))}
        </nav>

        {/* Stats Summary */}
        <div className="absolute bottom-6 left-6 right-6 space-y-3">
          <div className="border-2 border-black p-3 bg-[#F5F5F0]">
            <div className="text-xs mono tracking-[0.1em] text-gray-500">TOTAL HOURS</div>
            <div className="font-display text-lg font-bold">{totalHours.toFixed(1)}h</div>
          </div>
          <div className="border-2 border-black p-3 bg-[#F5F5F0]">
            <div className="text-xs mono tracking-[0.1em] text-gray-500">BILLABLE</div>
            <div className="font-display text-lg font-bold">{billableHours.toFixed(1)}h</div>
          </div>
          <div className="border-2 border-black p-3 bg-[#F5F5F0]">
            <div className="text-xs mono tracking-[0.1em] text-gray-500">OUTSTANDING</div>
            <div className="font-display text-lg font-bold text-[#FF2E63]">€{totalOutstanding.toFixed(0)}</div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b-2 border-black">
          <div>
            <h2 className="font-display text-3xl font-bold">
              {activeTab === "timer" && "TIME TRACKER"}
              {activeTab === "entries" && "TIME ENTRIES"}
              {activeTab === "invoices" && "INVOICES"}
              {activeTab === "create-invoice" && "CREATE INVOICE"}
            </h2>
            <p className="text-gray-500 mono text-sm">
              {activeTab === "timer" && "TRACK YOUR WORKING HOURS"}
              {activeTab === "entries" && "VIEW AND MANAGE TIME LOGS"}
              {activeTab === "invoices" && "MANAGE CLIENT BILLING"}
              {activeTab === "create-invoice" && "GENERATE NEW INVOICE FROM TIME ENTRIES"}
            </p>
          </div>

          {activeTab !== "create-invoice" && (
            <motion.button
              onClick={() => setActiveTab("create-invoice")}
              className="flex items-center gap-2 bg-[#FF2E63] text-white px-6 py-3 border-2 border-black font-bold mono"
              style={{ boxShadow: "4px 4px 0 0 #000" }}
              whileHover={{ x: -2, y: -2, boxShadow: "6px 6px 0 0 #000" }}
            >
              <Plus className="w-5 h-5" />
              NEW INVOICE
            </motion.button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {/* Timer Tab */}
          {activeTab === "timer" && (
            <motion.div
              key="timer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl"
            >
              <Timer projects={mockProjects} onEntryComplete={handleEntryComplete} />

              {/* Recent Entries */}
              <div className="mt-8">
                <h3 className="font-display text-xl font-bold mb-4">RECENT ENTRIES</h3>
                <div className="space-y-2">
                  {timeEntries.slice(0, 3).map((entry) => (
                    <div
                      key={entry.id}
                      className="border-2 border-black p-4 bg-white flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold">{entry.projectName}</div>
                        <div className="text-sm text-gray-600">{entry.description}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-display font-bold">
                          {(entry.duration / 3600).toFixed(1)}h
                        </div>
                        <div className="text-xs mono">
                          {entry.billable ? (
                            <span className="text-[#FF2E63]">BILLABLE</span>
                          ) : (
                            <span className="text-gray-400">NON-BILL</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Time Entries Tab */}
          {activeTab === "entries" && (
            <motion.div
              key="entries"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <TimeEntryList
                entries={timeEntries}
                onEdit={handleEditEntry}
                onDelete={handleDeleteEntry}
                onToggleBillable={handleToggleBillable}
                hourlyRate={100}
              />
            </motion.div>
          )}

          {/* Invoices Tab */}
          {activeTab === "invoices" && (
            <motion.div
              key="invoices"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Invoice Stats */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                {[
                  { label: "TOTAL INVOICED", value: `€${(totalPaid + totalOutstanding).toFixed(0)}`, color: "black" },
                  { label: "PAID", value: `€${totalPaid.toFixed(0)}`, color: "#FF2E63" },
                  { label: "OUTSTANDING", value: `€${totalOutstanding.toFixed(0)}`, color: "black" },
                  { label: "INVOICES", value: invoices.length.toString(), color: "gray" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="border-2 border-black bg-white p-4"
                    style={{ boxShadow: "4px 4px 0 0 #000" }}
                  >
                    <div className="text-2xl font-display font-bold" style={{ color: stat.color }}>
                      {stat.value}
                    </div>
                    <div className="text-xs text-gray-500 mono">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Invoice List */}
              <div className="space-y-3">
                {invoices.map((invoice) => (
                  <InvoiceListItem
                    key={invoice.id}
                    invoice={invoice}
                    onClick={() => {
                      setSelectedInvoice(invoice);
                      setShowInvoicePreview(true);
                    }}
                  />
                ))}
              </div>

              {/* Invoice Preview Modal */}
              {showInvoicePreview && selectedInvoice && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-8"
                  onClick={() => setShowInvoicePreview(false)}
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white max-w-4xl w-full max-h-[90vh] overflow-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="sticky top-0 bg-white border-b-2 border-black p-4 flex items-center justify-between z-10">
                      <div className="flex items-center gap-4">
                        <InvoiceStatusBadge status={selectedInvoice.status} />
                        <h3 className="font-display text-xl font-bold">{selectedInvoice.number}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Status Actions */}
                        {selectedInvoice.status === "draft" && (
                          <button
                            onClick={() => handleUpdateInvoiceStatus(selectedInvoice.id, "sent")}
                            className="px-4 py-2 border-2 border-black bg-black text-white font-bold text-xs mono"
                          >
                            MARK SENT
                          </button>
                        )}
                        {(selectedInvoice.status === "sent" || selectedInvoice.status === "overdue") && (
                          <button
                            onClick={() => handleUpdateInvoiceStatus(selectedInvoice.id, "paid")}
                            className="px-4 py-2 border-2 border-[#FF2E63] bg-[#FF2E63] text-white font-bold text-xs mono"
                          >
                            MARK PAID
                          </button>
                        )}
                        <button
                          onClick={() => setShowInvoicePreview(false)}
                          className="p-2 border-2 border-black hover:bg-[#FF2E63] hover:text-white hover:border-[#FF2E63] transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    <div className="p-6">
                      <InvoicePDF invoice={selectedInvoice} showPreview={true} />
                    </div>
                    <div className="sticky bottom-0 bg-white border-t-2 border-black p-4">
                      <InvoicePDF invoice={selectedInvoice} />
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Create Invoice Tab */}
          {activeTab === "create-invoice" && (
            <motion.div
              key="create-invoice"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl"
            >
              <InvoiceForm
                projects={mockProjects}
                timeEntries={timeEntries.filter((e) => e.billable && !e.invoiced)}
                onSubmit={handleCreateInvoice}
                defaultHourlyRate={100}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

