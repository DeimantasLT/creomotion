'use client';

import { useState } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Download,
  MessageSquare,
  Check,
  X
} from 'lucide-react';
import type { Deliverable } from '@/hooks/useClientProjects';

interface DeliverableCardProps {
  deliverable: Deliverable;
  onApprove: (deliverableId: string) => Promise<void>;
  onRequestChanges: (deliverableId: string, comment: string) => Promise<void>;
}

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
    color: 'text-gray-600', 
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-300',
  },
  'IN_PROGRESS': { 
    label: 'IN PROGRESS', 
    icon: Clock, 
    color: 'text-blue-700', 
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-400',
  },
  'IN_REVIEW': { 
    label: 'IN REVIEW', 
    icon: Clock, 
    color: 'text-yellow-700', 
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-400',
  },
  'APPROVED': { 
    label: 'APPROVED', 
    icon: CheckCircle2, 
    color: 'text-green-700', 
    bgColor: 'bg-green-100',
    borderColor: 'border-green-400',
  },
  'REJECTED': { 
    label: 'CHANGES REQUESTED', 
    icon: AlertCircle, 
    color: 'text-red-700', 
    bgColor: 'bg-red-100',
    borderColor: 'border-red-400',
  },
  'DELIVERED': { 
    label: 'DELIVERED', 
    icon: CheckCircle2, 
    color: 'text-green-800', 
    bgColor: 'bg-green-200',
    borderColor: 'border-green-500',
  },
  'PENDING': { 
    label: 'PENDING', 
    icon: Clock, 
    color: 'text-gray-600', 
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-300',
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
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const status = STATUS_CONFIG[deliverable.status];
  const StatusIcon = status.icon;

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
      setShowCommentInput(true);
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

  const canTakeAction = deliverable.status === 'DRAFT' || deliverable.status === 'IN_REVIEW';

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        {/* Thumbnail / File Icon */}
        <div className="w-full sm:w-24 h-24 border-2 border-black bg-[#F5F5F0] flex items-center justify-center flex-shrink-0">
          {deliverable.thumbnailUrl ? (
            <img 
              src={deliverable.thumbnailUrl} 
              alt={deliverable.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center">
              <FileText className="w-8 h-8 mx-auto text-gray-400" />
              <span className="text-xs mono text-gray-500 mt-1 block">
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
              <span className={`text-xs font-bold mono ${status.color}`}>
                {status.label}
              </span>
            </div>
            {deliverable.version > 1 && (
              <span className="text-xs bg-gray-200 px-2 py-0.5 mono border border-gray-300">
                V{deliverable.version}
              </span>
            )}
            {deliverable.fileSize && (
              <span className="text-xs mono text-gray-500">
                {formatFileSize(deliverable.fileSize)}
              </span>
            )}
          </div>

          <h4 className="font-bold text-lg mb-1">
            {deliverable.name}
          </h4>
          
          {deliverable.description && (
            <p className="text-sm text-gray-600 mb-3">
              {deliverable.description}
            </p>
          )}

          <p className="text-xs text-gray-400 mono">
            Uploaded {new Date(deliverable.createdAt).toLocaleDateString('lt-LT')}
          </p>

          {/* Actions */}
          {canTakeAction && (
            <div className="mt-4 space-y-3">
              {!showCommentInput ? (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleApprove}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white border-2 border-black font-bold text-sm mono hover:bg-green-600 disabled:opacity-50 transition-colors"
                  >
                    {isLoading ? (
                      <Clock className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    APPROVE
                  </button>
                  <button
                    onClick={() => setShowCommentInput(true)}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-black border-2 border-black font-bold text-sm mono hover:bg-gray-100 disabled:opacity-50 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    REQUEST CHANGES
                  </button>
                  {deliverable.fileUrl && (
                    <a
                      href={deliverable.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-[#F5F5F0] text-black border-2 border-black font-bold text-sm mono hover:bg-white transition-colors ml-auto"
                    >
                      <Download className="w-4 h-4" />
                      DOWNLOAD
                    </a>
                  )}
                </div>
              ) : (
                <div className="border-2 border-black bg-[#F5F5F0] p-3">
                  <label className="text-xs mono font-bold uppercase block mb-2">
                    Provide Feedback / Request Changes
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Describe what changes you'd like..."
                    className="w-full p-3 border-2 border-black bg-white text-sm focus:outline-none focus:bg-[#F5F5F0] resize-none"
                    rows={3}
                    disabled={isLoading}
                  />
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={handleRequestChanges}
                      disabled={isLoading || !comment.trim()}
                      className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white border-2 border-black font-bold text-sm mono hover:bg-yellow-600 disabled:opacity-50 transition-colors"
                    >
                      {isLoading ? (
                        <Clock className="w-4 h-4 animate-spin" />
                      ) : (
                        <AlertCircle className="w-4 h-4" />
                      )}
                      SUBMIT REQUEST
                    </button>
                    <button
                      onClick={() => {
                        setShowCommentInput(false);
                        setComment('');
                      }}
                      disabled={isLoading}
                      className="flex items-center gap-2 px-4 py-2 bg-white text-black border-2 border-black font-bold text-sm mono hover:bg-gray-100 disabled:opacity-50 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      CANCEL
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Completed State Actions */}
          {!canTakeAction && deliverable.fileUrl && (
            <div className="mt-4">
              <a
                href={deliverable.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#F5F5F0] text-black border-2 border-black font-bold text-sm mono hover:bg-white transition-colors"
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
