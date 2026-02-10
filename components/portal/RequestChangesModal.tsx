'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X, Loader2, Send } from 'lucide-react';

interface RequestChangesModalProps {
  isOpen: boolean;
  deliverableName: string;
  onConfirm: (comment: string) => Promise<void>;
  onCancel: () => void;
}

export function RequestChangesModal({ 
  isOpen, 
  deliverableName, 
  onConfirm, 
  onCancel 
}: RequestChangesModalProps) {
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (isLoading || !comment.trim()) return;
    setIsLoading(true);
    try {
      await onConfirm(comment);
      setComment('');
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
            <div className="w-full max-w-lg border-2 border-black bg-white shadow-brutalist-lg pointer-events-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b-2 border-black bg-yellow-50">
                <h3 className="font-display font-bold text-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  Request Changes
                </h3>
                <button
                  onClick={onCancel}
                  disabled={isLoading}
                  className="p-1 hover:bg-black hover:text-white transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-gray-600 mb-4 font-body">
                  Provide feedback for <span className="font-bold">{deliverableName}</span>:
                </p>
                
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Describe what needs to be changed, revised, or improved..."
                  rows={5}
                  disabled={isLoading}
                  className="w-full p-4 border-2 border-black bg-[#F5F5F0] focus:bg-white focus:outline-none resize-none font-mono text-sm transition-colors"
                />
                
                <p className="text-xs font-mono text-gray-500 mt-2">
                  * Your feedback will be sent to the admin team
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 p-4 border-t-2 border-black bg-gray-50">
                <button
                  onClick={handleConfirm}
                  disabled={isLoading || !comment.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-yellow-500 text-white border-2 border-black font-bold font-mono text-sm hover:bg-yellow-600 disabled:opacity-50 transition-colors"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  SUBMIT REQUEST
                </button>
                <button
                  onClick={onCancel}
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 bg-white text-black border-2 border-black font-bold font-mono text-sm hover:bg-black hover:text-white disabled:opacity-50 transition-colors"
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

export default RequestChangesModal;
