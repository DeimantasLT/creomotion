'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Clock, Euro, FileText, TrendingUp, Calendar, Zap } from 'lucide-react';

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

const PALETTE = {
  pink: "#ff006e",
  purple: "#8338ec",
  blue: "#3a86ff",
  yellow: "#ffbe0b",
  green: "#22c55e",
};

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
        color: PALETTE.purple,
        bgColor: '#141414',
        description: 'In progress',
      },
      {
        id: 'hours',
        label: 'HOURS THIS WEEK',
        value: `${stats.hoursThisWeek}h`,
        icon: Clock,
        color: PALETTE.pink,
        bgColor: '#141414',
        description: 'Tracked time',
      },
      {
        id: 'outstanding',
        label: 'OUTSTANDING INV.',
        value: `€${stats.outstandingInvoices.toLocaleString()}`,
        icon: FileText,
        color: PALETTE.blue,
        bgColor: '#141414',
        description: 'Awaiting payment',
      },
      {
        id: 'revenue',
        label: 'MONTHLY REVENUE',
        value: `€${(stats.monthlyRevenue / 1000).toFixed(1)}K`,
        icon: TrendingUp,
        color: PALETTE.yellow,
        bgColor: '#141414',
        description: 'This month',
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
        color: '#ffffff',
        bgColor: '#1a1a1a',
      },
      {
        id: 'total-hours',
        label: 'TOTAL HOURS LOGGED',
        value: `${stats.totalHours}h`,
        icon: Clock,
        color: '#ffffff',
        bgColor: '#1a1a1a',
      },
      {
        id: 'total-revenue',
        label: 'TOTAL REVENUE',
        value: `€${(stats.totalRevenue / 1000).toFixed(0)}K`,
        icon: Euro,
        color: PALETTE.pink,
        bgColor: '#1a1a1a',
      },
    ],
    [stats]
  );

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="border border-white/10 bg-[#141414] p-5 rounded-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="animate-pulse space-y-3">
              <div className="h-3 bg-white/5 w-1/2 rounded" />
              <div className="h-8 bg-white/5 w-1/3 rounded" />
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <motion.div 
        className="border border-white/10 bg-[#ff006e]/10 backdrop-blur-sm text-white p-5 rounded-xl"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <p className="font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#ff006e] flex items-center gap-2">
          <span>⚠</span>
          {error}
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mainCards.map((card, index) => (
          <motion.div
            key={card.id}
            className="relative group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
          >
            {/* Glow effect on hover */}
            <motion.div
              className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
              style={{ backgroundColor: `${card.color}10` }}
            />
            
            <div 
              className="relative border border-white/10 p-5 rounded-xl overflow-hidden"
              style={{ backgroundColor: card.bgColor }}
            >
              {/* Top gradient line */}
              <div 
                className="absolute top-0 left-0 right-0 h-px opacity-60"
                style={{ background: `linear-gradient(90deg, transparent, ${card.color}, transparent)` }}
              />
              
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] tracking-[0.2em] text-white/40 mb-1 font-[family-name:var(--font-jetbrains-mono)] uppercase">
                    {card.label}
                  </p>
                  <motion.span
                    className="text-2xl sm:text-3xl font-bold block"
                    style={{ color: card.color, fontFamily: 'var(--font-space-grotesk)' }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.2, duration: 0.3 }}
                  >
                    {card.value}
                  </motion.span>
                  <p className="text-[10px] text-white/30 mt-1 font-[family-name:var(--font-jetbrains-mono)]">
                    {card.description}
                  </p>
                </div>
                
                <motion.div
                  className="p-2.5 rounded-lg flex-shrink-0"
                  style={{ 
                    backgroundColor: `${card.color}15`,
                    border: `1px solid ${card.color}20`,
                  }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <card.icon className="w-4 h-4" style={{ color: card.color }} />
                </motion.div>
              </div>
              
              {/* Bottom corner accent */}
              <div 
                className="absolute -bottom-4 -right-4 w-16 h-16 rounded-full opacity-10 blur-2xl group-hover:opacity-20 transition-opacity"
                style={{ backgroundColor: card.color }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Secondary Stats (only in detailed mode) */}
      {detailed && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {secondaryCards.map((card, index) => (
            <motion.div
              key={card.id}
              className="relative group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: (mainCards.length + index) * 0.1, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
            >
              <div 
                className="border border-white/10 p-4 rounded-xl flex items-center gap-4"
                style={{ backgroundColor: card.bgColor }}
              >
                <motion.div
                  className="p-2 rounded-lg"
                  style={{ 
                    backgroundColor: card.color === PALETTE.pink ? `${PALETTE.pink}15` : 'transparent',
                    border: card.color === PALETTE.pink ? `1px solid ${PALETTE.pink}20` : '1px solid rgba(255,255,255,0.1)',
                  }}
                  whileHover={{ scale: 1.1 }}
                >
                  <card.icon 
                    className="w-4 h-4" 
                    style={{ color: card.color === PALETTE.pink ? PALETTE.pink : 'rgba(255,255,255,0.4)' }} 
                  />
                </motion.div>
                
                <div>
                  <p className="text-[10px] tracking-[0.15em] text-white/40 font-[family-name:var(--font-jetbrains-mono)] uppercase">
                    {card.label}
                  </p>
                  <span
                    className="text-lg font-bold"
                    style={{ 
                      color: card.color,
                      fontFamily: 'var(--font-space-grotesk)',
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
