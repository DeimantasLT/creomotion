'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, X, Loader2 } from 'lucide-react';

interface ApproveModalProps {
  isOpen: boolean;
  deliverableName: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export function ApproveModal({ 
  isOpen, 
  deliverableName, 
  onConfirm, 
  onCancel 
}: ApproveModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      await onConfirm();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 bg-black/50 z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="w-full max-w-md border border-white/10 bg-[#141414] pointer-events-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#0a0a0a]">
                <h3 className="font-display font-bold text-lg flex items-center gap-2 text-white">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  Confirm Approval
                </h3>
                <button
                  onClick={onCancel}
                  disabled={isLoading}
                  className="p-1 text-white/60 hover:text-[#ff006e] transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-white/60 mb-4">
                  Are you sure you want to approve this deliverable?
                </p>
                <div className="border border-white/10 bg-[#1a1a1a] p-3 mb-6">
                  <p className="font-bold font-display text-white">{deliverableName}</p>
                </div>
                <p className="text-sm text-white/40 font-mono">
                  Once approved, this will notify the admin and be marked as complete.
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 p-4 border-t border-white/10 bg-[#0a0a0a]">
                <button
                  onClick={handleConfirm}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-500/20 text-green-400 border border-green-500/30 font-bold font-mono text-sm hover:bg-green-500/30 disabled:opacity-50 transition-colors"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  CONFIRM APPROVAL
                </button>
                <button
                  onClick={onCancel}
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 bg-[#1a1a1a] text-white border border-white/10 font-bold font-mono text-sm hover:bg-white/10 hover:border-[#ff006e] hover:text-[#ff006e] disabled:opacity-50 transition-colors"
                >
                  CANCEL
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default ApproveModal;
