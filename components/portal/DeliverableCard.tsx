'use client';

// v2026-02-11-1549 - Force Rebuild

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Download,
  MessageSquare,
  Check,
  X,
  Play,
  Eye
} from 'lucide-react';
import { motion } from 'framer-motion';
import type { Deliverable } from '@/hooks/useClientProjects';

interface DeliverableCardProps {
  deliverable: Deliverable;
  onApprove: (deliverableId: string) => Promise<void>;
  onRequestChanges: (deliverableId: string, comment: string) => Promise<void>;
}

const PALETTE = {
  pink: "#ff006e",
  purple: "#8338ec",
  blue: "#3a86ff",
  yellow: "#ffbe0b",
  orange: "#fb5607",
};

const STATUS_CONFIG: Record<Deliverable['status'], { 
  label: string; 
  icon: typeof CheckCircle2;
  color: string; 
  bgColor: string;
  borderColor: string;
}> = {
  'DRAFT': { 
    label: 'PENDING REVIEW', 
    icon: Clock, 
    color: 'text-white/60', 
    bgColor: 'bg-white/5',
    borderColor: 'border-white/10',
  },
  'IN_PROGRESS': { 
    label: 'IN PROGRESS', 
    icon: Clock, 
    color: 'text-[#8338ec]', 
    bgColor: 'bg-[#8338ec]/10',
    borderColor: 'border-[#8338ec]/30',
  },
  'IN_REVIEW': { 
    label: 'IN REVIEW', 
    icon: Clock, 
    color: 'text-[#ffbe0b]', 
    bgColor: 'bg-[#ffbe0b]/10',
    borderColor: 'border-[#ffbe0b]/30',
  },
  'APPROVED': { 
    label: 'APPROVED', 
    icon: CheckCircle2, 
    color: 'text-[#3a86ff]', 
    bgColor: 'bg-[#3a86ff]/10',
    borderColor: 'border-[#3a86ff]/30',
  },
  'REJECTED': { 
    label: 'CHANGES REQUESTED', 
    icon: AlertCircle, 
    color: 'text-[#ff006e]', 
    bgColor: 'bg-[#ff006e]/10',
    borderColor: 'border-[#ff006e]/30',
  },
  'DELIVERED': { 
    label: 'DELIVERED', 
    icon: CheckCircle2, 
    color: 'text-green-400', 
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
  },
  'PENDING': { 
    label: 'PENDING', 
    icon: Clock, 
    color: 'text-white/60', 
    bgColor: 'bg-white/5',
    borderColor: 'border-white/10',
  },
};

function formatFileSize(bytes: number | null): string {
  if (!bytes) return '';
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

function getFileExtension(name: string): string {
  return name.split('.').pop()?.toUpperCase() || '';
}

export function DeliverableCard({ deliverable, onApprove, onRequestChanges }: DeliverableCardProps) {
  const router = useRouter();
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const status = STATUS_CONFIG[deliverable.status];
  const StatusIcon = status.icon;
  const isVideo = deliverable.fileUrl?.match(/\.(mp4|mov|avi|webm)$/i);

  const handleApprove = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      await onApprove(deliverable.id);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestChanges = async () => {
    if (isLoading) return;
    if (!comment.trim()) {
      // Open Frame.io review page for detailed feedback
      router.push(`/portal/deliverables/${deliverable.id}/review`);
      return;
    }
    setIsLoading(true);
    try {
      await onRequestChanges(deliverable.id, comment);
      setShowCommentInput(false);
      setComment('');
    } finally {
      setIsLoading(false);
    }
  };

  const canTakeAction = deliverable.status === 'DRAFT' || deliverable.status === 'IN_REVIEW' || deliverable.status === 'IN_PROGRESS';

  return (
    <div className="p-4 sm:p-6 border border-white/10 bg-[#141414]">
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        {/* Thumbnail / File Icon */}
        <div className="w-full sm:w-32 h-24 border border-white/10 bg-[#1a1a1a] flex items-center justify-center flex-shrink-0 relative overflow-hidden group cursor-pointer"
          onClick={() => isVideo && router.push(`/portal/deliverables/${deliverable.id}/review`)}
        >
          {deliverable.thumbnailUrl ? (
            <>
              <img 
                src={deliverable.thumbnailUrl} 
                alt={deliverable.name}
                className="w-full h-full object-cover"
              />
              {isVideo && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="w-12 h-12 rounded-full bg-[#ff006e] flex items-center justify-center"
                  >
                    <Play className="w-6 h-6 text-white fill-white" />
                  </motion.div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center">
              <FileText className="w-8 h-8 mx-auto text-white/30" />
              <span className="text-xs font-mono text-white/40 mt-1 block">
                {getFileExtension(deliverable.name)}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex flex-wrap items-start gap-2 mb-2">
            <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 border ${status.borderColor} ${status.bgColor}`}>
              <StatusIcon className={`w-3 h-3 ${status.color}`} />
              <span className={`text-xs font-bold font-mono ${status.color}`}>
                {status.label}
              </span>
            </div>
            {deliverable.version > 1 && (
              <span className="text-xs bg-white/5 px-2 py-0.5 font-mono border border-white/10 text-white/60">
                V{deliverable.version}
              </span>
            )}
            {deliverable.fileSize && (
              <span className="text-xs font-mono text-white/40">
                {formatFileSize(deliverable.fileSize)}
              </span>
            )}
            {isVideo && (
              <span className="text-xs px-2 py-0.5 rounded font-mono bg-[#ff006e]/20 text-[#ff006e] border border-[#ff006e]/30">
                VIDEO
              </span>
            )}
          </div>

          <h4 className="font-bold text-lg mb-1 text-white/90 hover:text-white transition-colors">
            {deliverable.name}
          </h4>
          
          {deliverable.description && (
            <p className="text-sm text-white/50 mb-3">
              {deliverable.description}
            </p>
          )}

          <p className="text-xs text-white/30 font-mono">
            Uploaded {new Date(deliverable.createdAt).toLocaleDateString('lt-LT')}
          </p>

          {/* Actions Row */}
          {canTakeAction && (
            <div className="mt-4 flex flex-wrap gap-2">
              {/* MAIN: Review in Frame.io style */}
              {isVideo && (
                <motion.button
                  onClick={() => router.push(`/portal/deliverables/${deliverable.id}/review`)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#ff006e] text-white border border-[#ff006e] font-bold text-sm font-mono hover:bg-[#ff006e]/90 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  REVIEW
                  <span className="text-[10px] opacity-70 font-normal">in player</span>
                </motion.button>
              )}

              <motion.button
                onClick={handleApprove}
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#3a86ff]/20 text-[#3a86ff] border border-[#3a86ff]/30 font-bold text-sm font-mono hover:bg-[#3a86ff]/30 disabled:opacity-50 transition-colors"
              >
                {isLoading ? (
                  <Clock className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                APPROVE
              </motion.button>

              <motion.button
                onClick={() => setShowCommentInput(true)}
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/5 text-white/70 border border-white/10 font-bold text-sm font-mono hover:bg-white/10 hover:text-white disabled:opacity-50 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                COMMENT
              </motion.button>

              {deliverable.fileUrl && (
                <a
                  href={deliverable.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 bg-white/5 text-white/70 border border-white/10 font-bold text-sm font-mono hover:bg-white/10 hover:text-white transition-colors ml-auto"
                >
                  <Download className="w-4 h-4" />
                  DOWNLOAD
                </a>
              )}
            </div>
          )}

          {/* Comment Input */}
          {showCommentInput && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 border border-white/10 bg-[#1a1a1a] p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-mono font-bold uppercase text-[#ff006e]">
                  Request Changes / Leave Comment
                </label>
                <button
                  onClick={() => {
                    router.push(`/portal/deliverables/${deliverable.id}/review`);
                  }}
                  className="text-xs font-mono text-[#3a86ff] hover:text-[#3a86ff]/80 flex items-center gap-1"
                >
                  <Play className="w-3 h-3" />
                  Open in Video Player →
                </button>
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Describe what changes you'd like, or go to video player for timestamp comments..."
                className="w-full p-3 border border-white/10 bg-[#0a0a0a] text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#ff006e] transition-colors resize-none"
                rows={3}
                disabled={isLoading}
              />
              <div className="flex items-center gap-2 mt-3">
                <motion.button
                  onClick={handleRequestChanges}
                  disabled={isLoading || !comment.trim()}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-4 py-2 bg-[#ffbe0b]/20 text-[#ffbe0b] border border-[#ffbe0b]/30 font-bold text-sm font-mono hover:bg-[#ffbe0b]/30 disabled:opacity-50 transition-colors"
                >
                  {isLoading ? (
                    <Clock className="w-4 h-4 animate-spin" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  SUBMIT REQUEST
                </motion.button>
                <motion.button
                  onClick={() => {
                    setShowCommentInput(false);
                    setComment('');
                  }}
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 text-white/70 border border-white/10 font-bold text-sm font-mono hover:bg-white/10 hover:text-white disabled:opacity-50 transition-colors"
                >
                  <X className="w-4 h-4" />
                  CANCEL
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Completed State Actions */}
          {!canTakeAction && deliverable.fileUrl && (
            <div className="mt-4 flex gap-2">
              {isVideo && (
                <motion.button
                  onClick={() => router.push(`/portal/deliverables/${deliverable.id}/review`)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#ff006e] text-white border border-[#ff006e] font-bold text-sm font-mono hover:bg-[#ff006e]/90 transition-colors"
                >
                  <Play className="w-4 h-4" />
                  WATCH
                </motion.button>
              )}
              <a
                href={deliverable.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 bg-white/5 text-white/70 border border-white/10 font-bold text-sm font-mono hover:bg-white/10 hover:text-white transition-colors"
              >
                <Download className="w-4 h-4" />
                DOWNLOAD
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
