'use client';

import { 
  FolderOpen, 
  FileCheck, 
  Clock, 
  CheckCircle2, 
  Building2,
  Crown,
  Star,
  Award
} from 'lucide-react';
import type { ClientStats } from '@/hooks/useClientProjects';

const PALETTE = {
  pink: "#ff006e",
  purple: "#8338ec",
  blue: "#3a86ff",
  yellow: "#ffbe0b",
  green: "#22c55e",
};

interface ClientDashboardProps {
  companyName: string;
  clientName: string;
  tier?: 'GOLD' | 'SILVER' | 'BRONZE';
  stats: ClientStats;
}

const TIER_CONFIG = {
  GOLD: {
    icon: Crown,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400/10',
    borderColor: 'border-yellow-400/30',
    label: 'GOLD CLIENT',
    glow: 'shadow-yellow-400/20',
  },
  SILVER: {
    icon: Star,
    color: 'text-gray-300',
    bgColor: 'bg-gray-400/10',
    borderColor: 'border-gray-400/30',
    label: 'SILVER CLIENT',
    glow: 'shadow-gray-400/20',
  },
  BRONZE: {
    icon: Award,
    color: 'text-orange-400',
    bgColor: 'bg-orange-400/10',
    borderColor: 'border-orange-400/30',
    label: 'BRONZE CLIENT',
    glow: 'shadow-orange-400/20',
  },
};

function TierBadge({ tier }: { tier: 'GOLD' | 'SILVER' | 'BRONZE' }) {
  const config = TIER_CONFIG[tier];
  const Icon = config.icon;
  
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 border ${config.borderColor} ${config.bgColor} rounded-sm`}>
      <Icon className={`w-4 h-4 ${config.color}`} />
      <span className={`text-xs font-bold font-mono tracking-wider ${config.color}`}>
        {config.label}
      </span>
    </div>
  );
}

export function ClientDashboard({ 
  companyName, 
  clientName,
  tier = 'BRONZE', 
  stats 
}: ClientDashboardProps) {
  const statCards = [
    {
      label: 'Active Projects',
      value: stats.activeProjects,
      icon: FolderOpen,
      color: PALETTE.blue,
      bgColor: 'bg-[#3a86ff]/10',
    },
    {
      label: 'Pending Review',
      value: stats.pendingApprovals,
      icon: Clock,
      color: PALETTE.yellow,
      bgColor: 'bg-[#ffbe0b]/10',
    },
    {
      label: 'Approved This Month',
      value: stats.approvedThisMonth,
      icon: CheckCircle2,
      color: PALETTE.green,
      bgColor: 'bg-green-500/10',
    },
    {
      label: 'Total Projects',
      value: stats.totalProjects,
      icon: FileCheck,
      color: PALETTE.purple,
      bgColor: 'bg-[#8338ec]/10',
    },
  ];

  return (
    <div className="border border-white/10 bg-[#141414] overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 border border-white/10 bg-[#1a1a1a] flex items-center justify-center flex-shrink-0">
              <Building2 className="w-6 h-6 text-white/60" />
            </div>
            <div>
              <h1 className="font-bold text-xl sm:text-2xl text-white/90 font-[family-name:var(--font-space-grotesk)]">
                {companyName}
              </h1>
              <p className="text-sm text-white/40 font-[family-name:var(--font-jetbrains-mono)] mt-1">
                {clientName}
              </p>
            </div>
          </div>
          <TierBadge tier={tier} />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 border-t border-white/10">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={stat.label}
              className={`p-4 sm:p-6 ${stat.bgColor} ${index > 0 ? 'border-l border-white/10' : ''} ${index >= 2 ? 'border-t lg:border-t-0 border-white/10' : ''}`}
            >
              <div className="flex items-center gap-3 mb-2">
                <Icon className="w-5 h-5" style={{ color: stat.color }} />
                <span className="text-xs font-bold font-mono uppercase text-white/50">
                  {stat.label}
                </span>
              </div>
              <div className="text-3xl sm:text-4xl font-bold text-white/90">
                {stat.value}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
