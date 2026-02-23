'use client';

import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Printer, Download, X } from 'lucide-react';
import type { InvoiceWithRelations } from '@/hooks/useInvoices';
import type { InvoiceSettings } from '@/hooks/useInvoiceSettings';
import { InvoiceHTMLContent } from './InvoiceHTML';

interface InvoiceHTMLViewerProps {
  invoice: InvoiceWithRelations;
  settings: InvoiceSettings;
  onClose?: () => void;
}

export default function InvoiceHTMLViewer({ invoice, settings, onClose }: InvoiceHTMLViewerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  const htmlContent = InvoiceHTMLContent({ invoice, settings });
  
  // Generate invoice number
  const prefix = settings?.invoicePrefix || 'CM';
  const num = invoice?.invoiceNumber 
    ? invoice.invoiceNumber.replace(prefix + '-', '')
    : String(settings?.nextInvoiceNumber || 1).padStart(4, '0');
  const invoiceNumber = `${prefix}-${num}`;

  // Create blob URL with proper filename
  useEffect(() => {
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    setBlobUrl(url);
    
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [htmlContent]);

  const handlePrintDirect = () => {
    // Open in new window with specific filename
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.title = invoiceNumber;
      printWindow.document.close();
      
      // Wait for styles to load then print
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 500);
    }
  };

  const handlePrintIframe = () => {
    const iframe = iframeRef.current;
    if (iframe?.contentWindow) {
      // Try to set iframe document title
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      if (iframeDoc) {
        iframeDoc.title = invoiceNumber;
      }
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    }
  };

  const handleDownload = () => {
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const filename = `${invoiceNumber}.html`;
    
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = () => {
    // Open print dialog with proper title
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.title = invoiceNumber;
      printWindow.document.close();
      
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 800);
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#0a0a0a] border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-sm text-white/80">Sąskaita: {invoiceNumber}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDownloadPDF}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#ff006e] text-white rounded text-xs font-medium"
          >
            <Printer className="w-3.5 h-3.5" />
            Spausdinti į PDF
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 text-white rounded text-xs font-medium"
          >
            <Download className="w-3.5 h-3.5" />
            HTML
          </motion.button>
          
          {onClose && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-1.5 text-white/60 hover:text-white"
            >
              <X className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      </div>

      {/* Preview */}
      <div className="flex-1 bg-gray-100 overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
            <div className="w-6 h-6 border-2 border-[#ff006e] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <iframe
          ref={iframeRef}
          data-invoice-id={invoice.id}
          srcDoc={htmlContent}
          className="w-full h-full border-0"
          onLoad={() => setLoading(false)}
          title={invoiceNumber}
          style={{ background: 'white' }}
        />
      </div>

      {/* Hint */}
      <div className="px-3 py-1.5 bg-[#0a0a0a] border-t border-white/10 text-center">
        <p className="text-[10px] text-white/40">
          💡 Spausdinti PDF atidarys naują langą su sąskaita
        </p>
      </div>
    </div>
  );
}
