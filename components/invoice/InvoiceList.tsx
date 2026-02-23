'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, CheckCircle, Send, AlertCircle, X, Eye, Plus, Edit, Trash2 } from 'lucide-react';
import { InvoiceWithRelations } from '@/hooks/useInvoices';
import { useInvoiceSettings } from '@/hooks/useInvoiceSettings';
import InvoiceHTMLViewer from './InvoiceHTMLViewer';

type InvoiceStatus = 'NOT_SENT' | 'SENT' | 'PAID';

const statusConfig: Record<string, { color: string; bg: string; icon: typeof FileText; label: string }> = {
  NOT_SENT: { color: 'text-white/60', bg: 'bg-white/5', icon: FileText, label: 'Draft' },
  SENT: { color: 'text-[#3a86ff]', bg: 'bg-[#3a86ff]/10', icon: Send, label: 'Sent' },
  PAID: { color: 'text-[#ff006e]', bg: 'bg-[#ff006e]/10', icon: CheckCircle, label: 'Paid' },
  DRAG: { color: 'text-white/60', bg: 'bg-white/5', icon: FileText, label: 'Draft' },
  OVERDUE: { color: 'text-red-400', bg: 'bg-red-500/10', icon: AlertCircle, label: 'Overdue' },
};

interface InvoiceListProps {
  invoices: InvoiceWithRelations[];
  loading: boolean;
  error: string | null;
  onEdit?: (invoice: InvoiceWithRelations) => void;
  onDelete?: (invoice: InvoiceWithRelations) => void;
  onStatusChange?: (invoice: InvoiceWithRelations, newStatus: string) => void;
  onCreate?: () => void;
  onRefresh?: () => void;
}

export default function InvoiceList({ 
  invoices, 
  loading, 
  error, 
  onEdit,
  onDelete,
  onStatusChange,
  onCreate,
  onRefresh 
}: InvoiceListProps) {
  const [previewInvoice, setPreviewInvoice] = useState<InvoiceWithRelations | null>(null);
  const { settings } = useInvoiceSettings();

  const getInvoiceNumber = (invoice: InvoiceWithRelations) => {
    if (invoice.invoiceNumber) return invoice.invoiceNumber;
    const prefix = settings?.invoicePrefix || 'CM';
    const num = invoice.id.slice(-4).toUpperCase();
    return `${prefix}-${num}`;
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('lt-LT');
  };

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(amount);

  // Cycle status: NOT_SENT -> SENT -> PAID -> NOT_SENT
  const cycleStatus = (currentStatus: string): string => {
    const statusOrder = ['NOT_SENT', 'SENT', 'PAID'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const nextIndex = (currentIndex + 1) % statusOrder.length;
    return statusOrder[nextIndex];
  };

  if (loading) {
    return (
      <div className="bg-[#141414] border border-white/10 rounded-sm p-8">
        <div className="flex items-center justify-center gap-3">
          <div className="w-5 h-5 border-2 border-[#ff006e] border-t-transparent rounded-full animate-spin" />
          <span className="text-white/60 text-sm">Loading invoices...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#141414] border border-red-500/30 rounded-sm p-6">
        <div className="flex items-center gap-3 text-red-400">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="bg-[#141414] border border-white/10 rounded-sm p-12">
        <div className="text-center">
          <FileText className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/60 mb-4">No invoices yet</p>
          {onCreate && (
            <button
              onClick={onCreate}
              className="px-4 py-2 bg-[#ff006e] text-white text-sm font-bold rounded-sm hover:bg-[#ff006e]/80 transition-colors"
            >
              Create Invoice
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-[#141414] border border-white/10 rounded-sm overflow-hidden">
        {/* Header */}
        <div className="bg-[#0a0a0a] border-b border-white/10 px-4 py-3 flex items-center justify-between">
          <h3 className="text-white font-bold text-sm">Invoices ({invoices.length})</h3>
          {onCreate && (
            <button
              onClick={onCreate}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#ff006e] text-white text-xs font-bold rounded-sm hover:bg-[#ff006e]/80 transition-colors"
            >
              <Plus className="w-3 h-3" />
              New
            </button>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#0a0a0a]">
              <tr>
                <th className="px-3 py-2 text-left text-[10px] font-mono text-white/50 uppercase tracking-wider">Invoice #</th>
                <th className="px-3 py-2 text-left text-[10px] font-mono text-white/50 uppercase tracking-wider">Client</th>
                <th className="px-3 py-2 text-left text-[10px] font-mono text-white/50 uppercase tracking-wider">Project</th>
                <th className="px-3 py-2 text-right text-[10px] font-mono text-white/50 uppercase tracking-wider">Amount</th>
                <th className="px-3 py-2 text-center text-[10px] font-mono text-white/50 uppercase tracking-wider">Status</th>
                <th className="px-3 py-2 text-center text-[10px] font-mono text-white/50 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {invoices.map((invoice) => {
                const status = invoice.status || 'NOT_SENT';
                const config = statusConfig[status] || statusConfig['NOT_SENT'];
                const Icon = config.icon;

                return (
                  <motion.tr
                    key={invoice.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-3 py-3">
                      <div className="font-mono text-xs text-white font-bold">{getInvoiceNumber(invoice)}</div>
                      <div className="text-[10px] text-white/40">{formatDate(invoice.invoiceDate || invoice.createdAt)}</div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="text-sm text-white">{invoice.client?.name || 'Unknown'}</div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="text-sm text-white/60">{invoice.project?.name || '-'}</div>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <span className="font-mono text-sm text-white">{formatCurrency(invoice.amount)}</span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <button
                        onClick={() => {
                          const newStatus = cycleStatus(invoice.status || 'NOT_SENT');
                          onStatusChange?.(invoice, newStatus);
                        }}
                        className={`inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase rounded-sm cursor-pointer transition-transform hover:scale-105 ${config.bg} ${config.color}`}
                        title="Click to change status"
                      >
                        <Icon className="w-3 h-3" />
                        {config.label}
                      </button>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-center gap-0.5">
                        <button
                          onClick={() => setPreviewInvoice(invoice)}
                          className="p-1.5 text-white/40 hover:text-white transition-colors"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEdit?.(invoice)}
                          className="p-1.5 text-white/40 hover:text-[#3a86ff] transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Delete this invoice?')) {
                              onDelete?.(invoice);
                            }
                          }}
                          className="p-1.5 text-white/40 hover:text-red-500 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewInvoice && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewInvoice(null)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-4xl h-[85vh] bg-[#141414] border border-white/10 rounded-sm overflow-hidden flex flex-col"
              >
                <div className="flex items-center justify-between p-3 border-b border-white/10 bg-[#0a0a0a]">
                  <span className="text-white font-bold text-sm">Invoice Preview</span>
                  <button
                    onClick={() => setPreviewInvoice(null)}
                    className="p-1 text-white/60 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex-1 p-4">
                  <InvoiceHTMLViewer
                    invoice={previewInvoice}
                    settings={settings}
                    onClose={() => setPreviewInvoice(null)}
                  />
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
