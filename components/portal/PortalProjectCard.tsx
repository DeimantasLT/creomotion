'use client';

// Rebuild trigger 1554 - Force dark theme

import { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Calendar, 
  DollarSign, 
  FileText,
  Clock,
  CheckCircle2,
  FolderKanban,
  ListTodo,
  Timer,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { DeliverableCard } from './DeliverableCard';
import { ProjectTasks } from './ProjectTasks';
import { ProjectTimeReport } from './ProjectTimeReport';
import type { Deliverable } from '@/hooks/useClientProjects';

const PALETTE = {
  pink: "#ff006e",
  purple: "#8338ec",
  blue: "#3a86ff",
  yellow: "#ffbe0b",
};

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
  'DRAFT': { label: 'DRAFT', color: 'text-white/60', bgColor: 'bg-white/5' },
  'IN_PROGRESS': { label: 'IN PROGRESS', color: 'text-[#8338ec]', bgColor: 'bg-[#8338ec]/10' },
  'REVIEW': { label: 'IN REVIEW', color: 'text-[#ffbe0b]', bgColor: 'bg-[#ffbe0b]/10' },
  'APPROVED': { label: 'APPROVED', color: 'text-[#3a86ff]', bgColor: 'bg-[#3a86ff]/10' },
  'COMPLETED': { label: 'COMPLETED', color: 'text-green-400', bgColor: 'bg-green-500/10' },
};

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG['DRAFT'];
  
  return (
    <span className={`inline-block px-3 py-1 text-xs font-bold font-mono ${config.bgColor} ${config.color} border border-white/10`}>
      {config.label}
    </span>
  );
}

function ProgressBar({ deliverables }: { deliverables: Deliverable[] }) {
  if (deliverables.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-white/40 font-mono">
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
        <span className="font-mono font-bold text-white/60">DELIVERABLES PROGRESS</span>
        <span className="font-mono font-bold" style={{ color: PALETTE.pink }}>{progress}%</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${progress}%`, backgroundColor: PALETTE.pink }}
        />
      </div>
      <div className="flex items-center gap-4 text-xs font-mono text-white/40">
        <span className="flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" style={{ color: PALETTE.blue }} />
          {approved} Approved
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" style={{ color: PALETTE.yellow }} />
          {inReview} In Review
        </span>
        <span className="flex items-center gap-1">
          <FileText className="w-3 h-3 text-white/30" />
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
    <div className="border border-white/10 bg-[#141414] overflow-hidden" data-theme="DARK-V2026">
      {/* Project Header - Always visible */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
        className="w-full p-4 sm:p-6 flex items-center justify-between transition-colors text-left"
      >
        <div className="flex-1 min-w-0 mr-4">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <StatusBadge status={project.status} />
            <span className="text-xs font-mono text-white/30">
              ID: {project.id.slice(0, 8)}
            </span>
          </div>
          <h3 className="font-bold text-lg sm:text-xl truncate text-white/90 flex items-center gap-2">
            {project.name}
            <span className="text-[10px] px-1.5 py-0.5 bg-[#ff006e] text-white font-mono">DARK-THEME-v2</span>
          </h3>
          {project.description && (
            <p className="text-sm text-white/50 mt-1 line-clamp-1">
              {project.description}
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end text-xs font-mono text-white/40">
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
          <div className="w-8 h-8 border border-white/10 flex items-center justify-center bg-[#1a1a1a]">
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-white/60" />
            ) : (
              <ChevronDown className="w-5 h-5 text-white/60" />
            )}
          </div>
        </div>
      </motion.button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-white/10">
          {/* Project Details */}
          <div className="p-4 sm:p-6 bg-[#0a0a0a]/50">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-mono text-white/40 uppercase">Deadline</label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="w-4 h-4 text-white/50" />
                  <span className="font-bold text-white/80">{formatDate(project.deadline)}</span>
                </div>
              </div>
              <div>
                <label className="text-xs font-mono text-white/40 uppercase">Budget</label>
                <div className="flex items-center gap-2 mt-1">
                  <DollarSign className="w-4 h-4 text-white/50" />
                  <span className="font-bold text-white/80">
                    {formatBudget(project.budget) || 'Not set'}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-xs font-mono text-white/40 uppercase">Created</label>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="w-4 h-4 text-white/50" />
                  <span className="font-bold text-white/80">{formatDate(project.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Deliverables Progress */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <ProgressBar deliverables={deliverables} />
            </div>
          </div>

          {/* Time Report Section - NEW */}
          <div className="border-t border-white/10">
            <div className="flex items-center justify-between p-4 bg-[#0a0a0a]">
              <h4 className="font-bold font-mono text-sm uppercase flex items-center gap-2 text-white/70">
                <Timer className="w-4 h-4" style={{ color: PALETTE.pink }} />
                Sugaištas laikas
              </h4>
            </div>
            <div className="p-4">
              <ProjectTimeReport projectId={project.id} />
            </div>
          </div>

          {/* Tasks Section */}
          <div className="border-t border-white/10">
            <div className="flex items-center justify-between p-4 bg-[#0a0a0a]">
              <h4 className="font-bold font-mono text-sm uppercase flex items-center gap-2 text-white/70">
                <ListTodo className="w-4 h-4" style={{ color: PALETTE.purple }} />
                Darbų progresas
              </h4>
            </div>
            <div className="p-4">
              <ProjectTasks projectId={project.id} />
            </div>
          </div>

          {/* Deliverables Section */}
          <div className="border-t border-white/10">
            <div className="flex items-center justify-between p-4 bg-[#0a0a0a]">
              <h4 className="font-bold font-mono text-sm uppercase flex items-center gap-2 text-white/70">
                <FolderKanban className="w-4 h-4" style={{ color: PALETTE.blue }} />
                 Deliverables ({deliverables.length})
              </h4>
            </div>
            
            {deliverables.length === 0 ? (
              <div className="p-8 text-center text-white/40 font-mono text-sm">
                No deliverables yet for this project.
              </div>
            ) : (
              <div>
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
