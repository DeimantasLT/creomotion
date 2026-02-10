'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Clock, Euro, FileText, TrendingUp, Calendar } from 'lucide-react';

interface Stats {
  activeProjects: number;
  hoursThisWeek: number;
  hoursToday: number;
  outstandingInvoices: number;
  monthlyRevenue: number;
  totalRevenue: number;
  totalHours: number;
}

interface StatsCardsProps {
  refreshTrigger?: number;
  detailed?: boolean;
}

export default function StatsCards({ refreshTrigger = 0, detailed = false }: StatsCardsProps) {
  const [stats, setStats] = useState<Stats>({
    activeProjects: 0,
    hoursThisWeek: 0,
    hoursToday: 0,
    outstandingInvoices: 0,
    monthlyRevenue: 0,
    totalRevenue: 0,
    totalHours: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch all data in parallel
        const [projectsRes, timeEntriesRes, invoicesRes] = await Promise.all([
          fetch('/api/projects'),
          fetch('/api/time-entries'),
          fetch('/api/invoices'),
        ]);

        if (!projectsRes.ok) throw new Error('Failed to fetch projects');
        if (!timeEntriesRes.ok) throw new Error('Failed to fetch time entries');
        if (!invoicesRes.ok) throw new Error('Failed to fetch invoices');

        const [projectsData, timeEntriesData, invoicesData] = await Promise.all([
          projectsRes.json(),
          timeEntriesRes.json(),
          invoicesRes.json(),
        ]);

        const projects = projectsData.projects || [];
        const timeEntries = timeEntriesData.timeEntries || [];
        const invoices = invoicesData.invoices || [];

        // Calculate date ranges
        const now = new Date();
        const today = new Date(now);
        today.setHours(0, 0, 0, 0);

        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Calculate stats
        const activeProjects = projects.filter(
          (p: any) => p.status === 'IN_PROGRESS'
        ).length;

        // Time entries calculations
        const todayEntries = timeEntries.filter((e: any) =>
          new Date(e.date).toDateString() === today.toDateString()
        );
        const weekEntries = timeEntries.filter((e: any) =>
          new Date(e.date) >= startOfWeek
        );

        const hoursToday = Math.round(
          todayEntries.reduce((sum: number, e: any) => sum + (e.duration || 0), 0) / 3600 * 10
        ) / 10;

        const hoursThisWeek = Math.round(
          weekEntries.reduce((sum: number, e: any) => sum + (e.duration || 0), 0) / 3600 * 10
        ) / 10;

        const totalHours = Math.round(
          timeEntries.reduce((sum: number, e: any) => sum + (e.duration || 0), 0) / 3600 * 10
        ) / 10;

        // Invoice calculations
        const outstandingInvoices = invoices
          .filter((i: any) => i.status === 'SENT' || i.status === 'OVERDUE')
          .reduce((sum: number, i: any) => sum + (i.amount || 0), 0);

        const monthlyRevenue = invoices
          .filter((i: any) =>
            i.status === 'PAID' &&
            i.paidAt &&
            new Date(i.paidAt) >= startOfMonth
          )
          .reduce((sum: number, i: any) => sum + (i.amount || 0), 0);

        const totalRevenue = invoices
          .filter((i: any) => i.status === 'PAID')
          .reduce((sum: number, i: any) => sum + (i.amount || 0), 0);

        setStats({
          activeProjects,
          hoursThisWeek,
          hoursToday,
          outstandingInvoices,
          monthlyRevenue,
          totalRevenue,
          totalHours,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [refreshTrigger]);

  const mainCards = useMemo(
    () => [
      {
        id: 'active',
        label: 'ACTIVE PROJECTS',
        value: stats.activeProjects.toString(),
        icon: Briefcase,
        color: '#000000',
        bgColor: '#FFFFFF',
      },
      {
        id: 'hours',
        label: 'HOURS THIS WEEK',
        value: `${stats.hoursThisWeek}h`,
        icon: Clock,
        color: '#FF2E63',
        bgColor: '#FFFFFF',
      },
      {
        id: 'outstanding',
        label: 'OUTSTANDING INV.',
        value: `€${stats.outstandingInvoices.toLocaleString()}`,
        icon: FileText,
        color: '#000000',
        bgColor: '#FFFFFF',
      },
      {
        id: 'revenue',
        label: 'MONTHLY REVENUE',
        value: `€${(stats.monthlyRevenue / 1000).toFixed(1)}K`,
        icon: TrendingUp,
        color: '#FF2E63',
        bgColor: '#FFFFFF',
      },
    ],
    [stats]
  );

  const secondaryCards = useMemo(
    () => [
      {
        id: 'hours-today',
        label: 'HOURS TODAY',
        value: `${stats.hoursToday}h`,
        icon: Calendar,
        color: '#000000',
        bgColor: '#F5F5F0',
      },
      {
        id: 'total-hours',
        label: 'TOTAL HOURS LOGGED',
        value: `${stats.totalHours}h`,
        icon: Clock,
        color: '#000000',
        bgColor: '#F5F5F0',
      },
      {
        id: 'total-revenue',
        label: 'TOTAL REVENUE',
        value: `€${(stats.totalRevenue / 1000).toFixed(0)}K`,
        icon: Euro,
        color: '#FF2E63',
        bgColor: '#F5F5F0',
      },
    ],
    [stats]
  );

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="border-2 border-black bg-white p-6 animate-pulse"
            style={{ boxShadow: '4px 4px 0 0 #000' }}
          >
            <div className="h-4 bg-gray-200 w-3/4 mb-4" />
            <div className="h-8 bg-gray-200 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="border-2 border-black bg-[#FF2E63] text-white p-6 mb-8"
        style={{ boxShadow: '4px 4px 0 0 #000' }}
      >
        <p className="font-mono text-sm">[ERROR: {error}]</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mainCards.map((card, index) => (
          <motion.div
            key={card.id}
            className="border-2 border-black p-6"
            style={{
              backgroundColor: card.bgColor,
              boxShadow: '4px 4px 0 0 #000',
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p
                  className="text-xs tracking-[0.2em] text-black/60 mb-2"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  [{card.label}]
                </p>
                <span
                  className="text-3xl font-bold"
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    color: card.color,
                  }}
                >
                  {card.value}
                </span>
              </div>
              <div
                className="p-3 border-2 border-black"
                style={{
                  backgroundColor: card.color === '#FF2E63' ? '#FF2E63' : '#000',
                }}
              >
                <card.icon className="w-5 h-5 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Secondary Stats (only in detailed mode) */}
      {detailed && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {secondaryCards.map((card, index) => (
            <motion.div
              key={card.id}
              className="border-2 border-black p-4"
              style={{
                backgroundColor: card.bgColor,
                boxShadow: '4px 4px 0 0 #000',
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: (mainCards.length + index) * 0.1 }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="p-2 border-2 border-black"
                  style={{
                    backgroundColor: card.color === '#FF2E63' ? '#FF2E63' : 'transparent',
                  }}
                >
                  <card.icon
                    className={`w-4 h-4 ${
                      card.color === '#FF2E63' ? 'text-white' : 'text-black'
                    }`}
                  />
                </div>
                <div>
                  <p
                    className="text-xs tracking-[0.15em] text-black/50"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {card.label}
                  </p>
                  <span
                    className="text-xl font-bold"
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      color: card.color,
                    }}
                  >
                    {card.value}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
