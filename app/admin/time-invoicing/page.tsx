'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Clock, FileText } from 'lucide-react';
import TimeTracker from '@/components/admin/TimeTracker';
import QuickTimeTracker from '@/components/admin/QuickTimeTracker';
import InvoiceList from '@/components/invoice/InvoiceList';
import CreateInvoiceModal from '@/components/invoice/CreateInvoiceModal';
import { useInvoices } from '@/hooks/useInvoices';

export default function AdminTimeInvoicingPage() {
  const { invoices, loading, refresh } = useInvoices();
  const [showCreateInvoice, setShowCreateInvoice] = useState(false);
  const [activeTab, setActiveTab] = useState<'time' | 'invoices'>('time');

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Time & Invoicing</h1>
          <p className="text-slate-400 mt-1">Track time and manage invoices</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => setActiveTab('time')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
            activeTab === 'time'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Clock className="w-5 h-5" />
          Time Tracking
        </button>
        <button
          onClick={() => setActiveTab('invoices')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
            activeTab === 'invoices'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <FileText className="w-5 h-5" />
          Invoices
        </button>
      </div>

      {/* Content */}
      {activeTab === 'time' ? (
        <div className="space-y-8">
          <QuickTimeTracker />
          <TimeTracker />
        </div>
      ) : (
        <div>
          <div className="flex justify-end mb-6">
            <button
              onClick={() => setShowCreateInvoice(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
            >
              <Plus className="w-5 h-5" />
              Create Invoice
            </button>
          </div>
          <InvoiceList invoices={invoices} />
        </div>
      )}

      {/* Modals */}
      {showCreateInvoice && (
        <CreateInvoiceModal
          onClose={() => setShowCreateInvoice(false)}
          onSuccess={() => {
            setShowCreateInvoice(false);
            refresh();
          }}
        />
      )}
    </div>
  );
}
