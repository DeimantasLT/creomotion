'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  FolderKanban,
  Users,
  Clock,
  FileText,
  TrendingUp,
  ArrowRight,
  Plus,
} from 'lucide-react';
import StatsCards from '@/components/admin/StatsCards';
import QuickActionMenu from '@/components/admin/QuickActionMenu';
import { useProjects } from '@/hooks/useProjects';
import { useClients } from '@/hooks/useClients';
import { useInvoices } from '@/hooks/useInvoices';

const quickActions = [
  { label: 'New Project', href: '/admin/projects', icon: FolderKanban },
  { label: 'Add Client', href: '/admin/clients', icon: Users },
  { label: 'Track Time', href: '/admin/time-invoicing', icon: Clock },
  { label: 'Create Invoice', href: '/admin/time-invoicing', icon: FileText },
];

export default function AdminDashboard() {
  const { projects } = useProjects();
  const { clients } = useClients();
  const { invoices } = useInvoices();

  const recentProjects = projects.slice(0, 5);
  const activeProjects = projects.filter(p => p.status === 'IN_PROGRESS').length;
  const pendingInvoices = invoices.filter(i => i.status === 'DRAFT').length;

  return (
    <div>
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 mt-1">Welcome back! Here's what's happening.</p>
      </div>

      {/* Stats */}
      <StatsCards />

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="flex flex-col items-center gap-3 p-6 bg-slate-800/50 border border-slate-700 rounded-2xl hover:border-cyan-500/50 hover:bg-slate-800 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <action.icon className="w-6 h-6 text-cyan-400" />
              </div>
              <span className="text-white font-medium">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Projects */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Recent Projects</h2>
          <Link
            href="/admin/projects"
            className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-800/80">
              <tr>
                <th className="text-left px-6 py-4 text-slate-400 font-medium">Project</th>
                <th className="text-left px-6 py-4 text-slate-400 font-medium">Client</th>
                <th className="text-left px-6 py-4 text-slate-400 font-medium">Status</th>
                <th className="text-left px-6 py-4 text-slate-400 font-medium">Progress</th>
              </tr>
            </thead>
            <tbody>
              {recentProjects.map((project) => (
                <tr key={project.id} className="border-t border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                  <td className="px-6 py-4">
                    <Link href={`/admin/projects/${project.id}`} className="text-white font-medium hover:text-cyan-400 transition-colors">
                      {project.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-slate-400">{project.client?.name || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      project.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
                      project.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-400' :
                      project.status === 'ON_HOLD' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-slate-500/20 text-slate-400'
                    }`}>
                      {project.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                          style={{ width: `${project.progress || 0}%` }}
                        />
                      </div>
                      <span className="text-slate-400 text-sm">{project.progress || 0}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Timer */}
      <QuickActionMenu />
    </div>
  );
}
