'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Printer, Mail, Loader2 } from 'lucide-react';
import InvoiceHTMLViewer from './InvoiceHTMLViewer';
import { useInvoiceSettings } from '@/hooks/useInvoiceSettings';
import type { InvoiceWithRelations } from '@/hooks/useInvoices';

interface InvoicePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: InvoiceWithRelations | null;
}

export default function InvoicePreviewModal({
  isOpen,
  onClose,
  invoice,
}: InvoicePreviewModalProps) {
  const [activeTab, setActiveTab] = useState<'preview' | 'download' | 'send'>('preview');
  const { settings, loading } = useInvoiceSettings();

  if (!isOpen || !invoice) return null;

  const handlePrint = () => {
    const iframe = document.querySelector('iframe[data-invoice-id="' + invoice.id + '" ]') as HTMLIFrameElement;
    if (iframe?.contentWindow) {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    }
  };

  if (loading || !settings) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="fixed inset-0 z-50 flex flex-col bg-[#0a0a0a] border-t-2 border-pink-500 rounded-t-2xl shadow-2xl"
            >
              <div className="flex items-center justify-between p-6 border-b-2 border-white/10">
                <h3 className="font-display text-xl font-bold">Sąskaitos peržiūra</h3>
                <button onClick={onClose} className="p-2 border-2 border-white hover:bg-white hover:text-black transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#ff006e]" />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed inset-0 z-50 flex flex-col bg-[#0a0a0a] rounded-t-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-[#0a0a0a] border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-[#ff006e]">📄</span>
                <span className="font-bold text-white">Sąskaita: {invoice.invoiceNumber || invoice.id.slice(0, 8).toUpperCase()}</span>
              </div>
              
              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2 bg-[#ff006e] text-white rounded-lg font-medium text-sm"
                >
                  <Printer className="w-4 h-4" />
                  Spausdinti
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="p-2 text-white/60 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            {/* Preview */}
            <div className="flex-1 bg-gray-100 overflow-hidden relative">
              <InvoiceHTMLViewer
                invoice={invoice}
                settings={settings}
                onClose={onClose}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
