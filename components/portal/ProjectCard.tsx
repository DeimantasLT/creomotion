'use client';

import { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Calendar, 
  DollarSign, 
  FileText,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { DeliverableCard } from './DeliverableCard';
import type { Deliverable } from '@/hooks/useClientProjects';

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    description: string | null;
    status: string;
    budget?: number | null;
    deadline: string | null;
    clientId?: string;
    createdAt: string;
  };
  deliverables: Deliverable[];
  onApproveDeliverable: (deliverableId: string) => Promise<void>;
  onRequestChanges: (deliverableId: string, comment: string) => Promise<void>;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  'DRAFT': { label: 'DRAFT', color: 'text-gray-600', bgColor: 'bg-gray-100' },
  'IN_PROGRESS': { label: 'IN PROGRESS', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  'REVIEW': { label: 'IN REVIEW', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  'APPROVED': { label: 'APPROVED', color: 'text-green-700', bgColor: 'bg-green-100' },
  'COMPLETED': { label: 'COMPLETED', color: 'text-green-700', bgColor: 'bg-green-100' },
};

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG['DRAFT'];
  
  return (
    <span className={`inline-block px-3 py-1 text-xs font-bold mono ${config.bgColor} ${config.color} border-2 border-black`}>
      {config.label}
    </span>
  );
}

function ProgressBar({ deliverables }: { deliverables: Deliverable[] }) {
  if (deliverables.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500 mono">
        <FileText className="w-4 h-4" />
        No deliverables yet
      </div>
    );
  }

  const approved = deliverables.filter(d => d.status === 'APPROVED').length;
  const inReview = deliverables.filter(d => d.status === 'IN_REVIEW').length;
  const pending = deliverables.filter(d => d.status === 'DRAFT' || d.status === 'REJECTED').length;
  const progress = Math.round((approved / deliverables.length) * 100);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="mono font-bold">PROJECT PROGRESS</span>
        <span className="mono font-bold text-[#FF2E63]">{progress}%</span>
      </div>
      <div className="h-3 border-2 border-black bg-gray-100">
        <div 
          className="h-full bg-[#FF2E63] transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex items-center gap-4 text-xs mono">
        <span className="flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-green-600" />
          {approved} Approved
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-yellow-600" />
          {inReview} In Review
        </span>
        <span className="flex items-center gap-1">
          <FileText className="w-3 h-3 text-gray-500" />
          {pending} Pending
        </span>
      </div>
    </div>
  );
}

export function ProjectCard({ 
  project, 
  deliverables,
  onApproveDeliverable,
  onRequestChanges
}: ProjectCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No deadline';
    return new Date(dateString).toLocaleDateString('lt-LT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatBudget = (budget: number | null) => {
    if (!budget) return null;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
    }).format(budget);
  };

  return (
    <div className="border-2 border-black bg-white overflow-hidden">
      {/* Project Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 sm:p-6 flex items-center justify-between hover:bg-[#F5F5F0] transition-colors text-left"
      >
        <div className="flex-1 min-w-0 mr-4">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <StatusBadge status={project.status} />
            <span className="text-xs mono text-gray-500">
              ID: {project.id.slice(0, 8)}
            </span>
          </div>
          <h3 className="font-bold text-lg sm:text-xl truncate">
            {project.name}
          </h3>
          {project.description && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-1">
              {project.description}
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end text-xs mono text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(project.deadline)}
            </div>
            {project.budget && (
              <div className="flex items-center gap-1 mt-1">
                <DollarSign className="w-3 h-3" />
                {formatBudget(project.budget)}
              </div>
            )}
          </div>
          <div className="w-8 h-8 border-2 border-black flex items-center justify-center bg-white">
            {isExpanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </div>
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t-2 border-black">
          {/* Project Details */}
          <div className="p-4 sm:p-6 bg-[#F5F5F0]">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs mono text-gray-500 uppercase">Deadline</label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="w-4 h-4 text-gray-600" />
                  <span className="font-bold">{formatDate(project.deadline)}</span>
                </div>
              </div>
              <div>
                <label className="text-xs mono text-gray-500 uppercase">Budget</label>
                <div className="flex items-center gap-2 mt-1">
                  <DollarSign className="w-4 h-4 text-gray-600" />
                  <span className="font-bold">
                    {formatBudget(project.budget) || 'Not set'}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-xs mono text-gray-500 uppercase">Created</label>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="w-4 h-4 text-gray-600" />
                  <span className="font-bold">{formatDate(project.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-6 pt-6 border-t-2 border-dashed border-gray-300">
              <ProgressBar deliverables={deliverables} />
            </div>
          </div>

          {/* Deliverables Section */}
          <div className="border-t-2 border-black">
            <div className="flex items-center justify-between p-4 bg-black text-white">
              <h4 className="font-bold mono text-sm uppercase flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Deliverables ({deliverables.length})
              </h4>
            </div>
            
            {deliverables.length === 0 ? (
              <div className="p-8 text-center text-gray-500 mono">
                No deliverables yet for this project.
              </div>
            ) : (
              <div className="divide-y-2 divide-gray-200">
                {deliverables
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((deliverable) => (
                    <DeliverableCard
                      key={deliverable.id}
                      deliverable={deliverable}
                      onApprove={onApproveDeliverable}
                      onRequestChanges={onRequestChanges}
                    />
                  ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
