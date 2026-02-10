"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Download, CheckCircle, Send, AlertCircle, X, Eye } from "lucide-react";
import { Invoice } from "@/types";
import InvoicePDF, { transformInvoiceToPDFData } from "./InvoicePDF";

type InvoiceStatus = "DRAFT" | "SENT" | "PAID" | "OVERDUE";

interface InvoiceWithRelations extends Invoice {
  project?: { name: string };
  client?: { name: string; email: string; company?: string };
  createdAt?: Date | string;
}

const statusConfig: Record<InvoiceStatus, { color: string; bgColor: string; icon: typeof CheckCircle }> = {
  DRAFT: { color: "text-gray-600", bgColor: "bg-gray-200", icon: FileText },
  SENT: { color: "text-blue-600", bgColor: "bg-blue-100", icon: Send },
  PAID: { color: "text-green-600", bgColor: "bg-green-100", icon: CheckCircle },
  OVERDUE: { color: "text-red-600", bgColor: "bg-red-100", icon: AlertCircle },
};

function StatusBadge({ status }: { status: InvoiceStatus }) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-bold uppercase tracking-wider border-2 border-black ${config.bgColor} ${config.color}`}>
      <Icon className="w-3 h-3" />
      {status}
    </span>
  );
}

interface InvoiceListProps {
  refreshTrigger?: number;
}

export default function InvoiceList({ refreshTrigger = 0 }: InvoiceListProps) {
  const [invoices, setInvoices] = useState<InvoiceWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceWithRelations | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [filter, setFilter] = useState<InvoiceStatus | "ALL">("ALL");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/invoices");
      if (!response.ok) throw new Error("Failed to fetch invoices");
      const data = await response.json();
      setInvoices(data.invoices || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load invoices");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices, refreshTrigger]);

  const handleStatusChange = async (invoiceId: string, newStatus: InvoiceStatus) => {
    setActionLoading(invoiceId);
    try {
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) throw new Error("Failed to update status");
      
      // Update local state
      setInvoices(prev => 
        prev.map(inv => inv.id === invoiceId ? { ...inv, status: newStatus } : inv)
      );
    } catch (err) {
      console.error("Status update error:", err);
      alert("Failed to update status");
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkSent = async (invoiceId: string) => {
    await handleStatusChange(invoiceId, "SENT");
  };

  const handleMarkPaid = async (invoiceId: string) => {
    await handleStatusChange(invoiceId, "PAID");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IE", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const formatDate = (dateStr?: Date | string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const filteredInvoices = filter === "ALL" 
    ? invoices 
    : invoices.filter(inv => inv.status === filter);

  // Calculate stats
  const stats = {
    total: invoices.length,
    draft: invoices.filter(i => i.status === "DRAFT").length,
    sent: invoices.filter(i => i.status === "SENT").length,
    paid: invoices.filter(i => i.status === "PAID").length,
    overdue: invoices.filter(i => i.status === "OVERDUE").length,
    outstanding: invoices
      .filter(i => i.status === "SENT" || i.status === "OVERDUE")
      .reduce((sum, i) => sum + (i.amount || 0), 0),
    totalPaid: invoices
      .filter(i => i.status === "PAID")
      .reduce((sum, i) => sum + (i.amount || 0), 0),
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="border-2 border-black bg-white p-4 animate-pulse">
            <div className="h-4 bg-gray-200 w-1/4 mb-2" />
            <div className="h-4 bg-gray-200 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="border-2 border-black bg-[#FF2E63] text-white p-6">
        <p className="font-mono text-sm">[ERROR: {error}]</p>
        <button 
          onClick={fetchInvoices}
          className="mt-4 px-4 py-2 border-2 border-white hover:bg-white hover:text-[#FF2E63] transition-colors text-sm font-bold"
        >
          RETRY
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "TOTAL", value: stats.total, color: "bg-black text-white" },
          { label: "DRAFT", value: stats.draft, color: "bg-gray-200" },
          { label: "SENT", value: stats.sent, color: "bg-blue-100" },
          { label: "PAID", value: stats.paid, color: "bg-green-100" },
          { label: "OVERDUE", value: stats.overdue, color: "bg-red-100" },
        ].map((stat) => (
          <button
            key={stat.label}
            onClick={() => setFilter(stat.label as InvoiceStatus | "ALL")}
            className={`border-2 border-black p-3 text-center transition-all ${stat.color} ${filter === stat.label ? "ring-2 ring-[#FF2E63]" : "hover:shadow-[4px_4px_0_0_#000]"}`}
          >
            <div className="text-2xl font-bold font-display">{stat.value}</div>
            <div className="text-xs font-mono tracking-wider">{stat.label}</div>
          </button>
        ))}
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="border-2 border-black bg-white p-4" style={{ boxShadow: "4px 4px 0 0 #000" }}>
          <div className="text-xs text-gray-500 font-mono mb-1">OUTSTANDING</div>
          <div className="text-xl font-bold text-[#FF2E63]">{formatCurrency(stats.outstanding)}</div>
        </div>
        <div className="border-2 border-black bg-white p-4" style={{ boxShadow: "4px 4px 0 0 #000" }}>
          <div className="text-xs text-gray-500 font-mono mb-1">TOTAL PAID</div>
          <div className="text-xl font-bold text-green-600">{formatCurrency(stats.totalPaid)}</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-mono tracking-wider">FILTER:</span>
        {["ALL", "DRAFT", "SENT", "PAID", "OVERDUE"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as InvoiceStatus | "ALL")}
            className={`px-3 py-1 text-xs font-bold border-2 border-black transition-colors ${
              filter === f ? "bg-black text-white" : "bg-white hover:bg-gray-100"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Invoice List */}
      {filteredInvoices.length === 0 ? (
        <div className="border-2 border-black border-dashed p-12 text-center">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500 font-mono">NO INVOICES FOUND</p>
          {filter !== "ALL" && (
            <button
              onClick={() => setFilter("ALL")}
              className="mt-4 text-[#FF2E63] hover:underline text-sm"
            >
              Clear filter
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filteredInvoices.map((invoice, index) => (
              <motion.div
                key={invoice.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className="border-2 border-black bg-white p-4 hover:shadow-[4px_4px_0_0_#000] transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left: Invoice Info */}
                  <div className="flex items-center gap-4">
                    <div className="border-2 border-black p-3 bg-black text-white">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-lg">
                        INV-{invoice.id.slice(0, 8).toUpperCase()}
                      </div>
                      <div className="text-sm text-gray-600">
                        {invoice.client?.name || invoice.clientId} — {invoice.project?.name || invoice.projectId}
                      </div>
                      <div className="text-xs text-gray-400 font-mono mt-1">
                        Due: {formatDate(invoice.dueDate)}{invoice.createdAt ? ` • Created: ${formatDate(invoice.createdAt)}` : ''}
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount & Actions */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-xl font-bold font-display">
                        {formatCurrency(invoice.amount || 0)}
                      </div>
                      <StatusBadge status={invoice.status as InvoiceStatus} />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedInvoice(invoice);
                          setShowPreview(true);
                        }}
                        className="p-2 border-2 border-black hover:bg-black hover:text-white transition-colors"
                        title="View Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {invoice.status === "DRAFT" && (
                        <button
                          onClick={() => handleMarkSent(invoice.id)}
                          disabled={actionLoading === invoice.id}
                          className="px-3 py-2 border-2 border-black bg-black text-white text-xs font-bold uppercase hover:bg-[#FF2E63] hover:border-[#FF2E63] transition-colors disabled:opacity-50"
                        >
                          {actionLoading === invoice.id ? "..." : <Send className="w-4 h-4" />}
                        </button>
                      )}

                      {(invoice.status === "SENT" || invoice.status === "OVERDUE") && (
                        <button
                          onClick={() => handleMarkPaid(invoice.id)}
                          disabled={actionLoading === invoice.id}
                          className="px-3 py-2 border-2 border-green-600 bg-green-600 text-white text-xs font-bold uppercase hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          {actionLoading === invoice.id ? "..." : <CheckCircle className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && selectedInvoice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowPreview(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white max-w-4xl w-full max-h-[90vh] overflow-auto border-2 border-black"
              style={{ boxShadow: "8px 8px 0 0 #000" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-black text-white p-4 flex items-center justify-between z-10 border-b-2 border-black">
                <div className="flex items-center gap-4">
                  <StatusBadge status={selectedInvoice.status as InvoiceStatus} />
                  <h3 className="font-display text-xl font-bold">
                    INV-{selectedInvoice.id.slice(0, 8).toUpperCase()}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowPreview(false)}
                    className="p-2 border-2 border-white hover:bg-white hover:text-black transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* PDF Preview */}
              <div className="p-6">
                <InvoicePDF 
                  invoice={transformInvoiceToPDFData(selectedInvoice)} 
                  showPreview={true} 
                />
              </div>

              {/* Modal Footer with PDF Download */}
              <div className="sticky bottom-0 bg-white border-t-2 border-black p-4">
                <InvoicePDF invoice={transformInvoiceToPDFData(selectedInvoice)} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
