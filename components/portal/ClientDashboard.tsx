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

interface ClientDashboardProps {
  companyName: string;
  clientName: string;
  tier?: 'GOLD' | 'SILVER' | 'BRONZE';
  stats: ClientStats;
}

const TIER_CONFIG = {
  GOLD: {
    icon: Crown,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-400',
    label: 'GOLD TIER',
  },
  SILVER: {
    icon: Star,
    color: 'text-gray-600',
    bgColor: 'bg-gray-200',
    borderColor: 'border-gray-400',
    label: 'SILVER TIER',
  },
  BRONZE: {
    icon: Award,
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
    borderColor: 'border-orange-400',
    label: 'BRONZE TIER',
  },
};

function TierBadge({ tier }: { tier: 'GOLD' | 'SILVER' | 'BRONZE' }) {
  const config = TIER_CONFIG[tier];
  const Icon = config.icon;
  
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 border-2 ${config.borderColor} ${config.bgColor}`}>
      <Icon className={`w-4 h-4 ${config.color}`} />
      <span className={`text-xs font-bold mono ${config.color}`}>
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
      color: 'bg-blue-100 border-blue-400',
    },
    {
      label: 'Pending Approvals',
      value: stats.pendingApprovals,
      icon: Clock,
      color: 'bg-yellow-100 border-yellow-400',
    },
    {
      label: 'Completed This Month',
      value: stats.approvedThisMonth,
      icon: CheckCircle2,
      color: 'bg-green-100 border-green-400',
    },
    {
      label: 'Total Projects',
      value: stats.totalProjects,
      icon: FileCheck,
      color: 'bg-purple-100 border-purple-400',
    },
  ];

  return (
    <div className="border-2 border-black bg-white brutalist-shadow">
      {/* Header */}
      <div className="p-6 border-b-2 border-black">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 border-2 border-black bg-[#F5F5F0] flex items-center justify-center flex-shrink-0">
              <Building2 className="w-6 h-6 text-gray-700" />
            </div>
            <div>
              <h1 className="font-display text-xl sm:text-2xl font-bold">
                {companyName}
              </h1>
              <p className="text-sm text-gray-500 mono mt-1">
                {clientName}
              </p>
            </div>
          </div>
          <TierBadge tier={tier} />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-x-2 divide-y-2 lg:divide-y-0 divide-black border-b-2 border-black">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={stat.label}
              className={`p-4 sm:p-6 ${stat.color} ${index >= 2 ? 'border-t-2 lg:border-t-0' : ''} ${index % 2 === 1 ? 'border-l-2 lg:border-l-0' : ''}`}
            >
              <div className="flex items-center gap-3 mb-2">
                <Icon className="w-5 h-5 text-gray-700" />
                <span className="text-xs font-bold mono text-gray-600 uppercase">
                  {stat.label}
                </span>
              </div>
              <div className="text-3xl sm:text-4xl font-bold">
                {stat.value}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
