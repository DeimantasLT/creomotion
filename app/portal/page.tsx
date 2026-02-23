'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  LogOut, 
  Loader2, 
  AlertTriangle,
  FolderKanban,
  Building2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { ClientDashboard } from '@/components/portal/ClientDashboard';
import { ProjectCard } from '@/components/portal/PortalProjectCard';
import { ApproveModal } from '@/components/portal/ApproveModal';
import { RequestChangesModal } from '@/components/portal/RequestChangesModal';
import { useClientProjects } from '@/hooks/useClientProjects';
import { useDeliverables } from '@/hooks/useDeliverables';
import { authApi } from '@/lib/api';

const PALETTE = {
  pink: "#ff006e",
  purple: "#8338ec",
  blue: "#3a86ff",
};

export default function ClientPortal() {
  const router = useRouter();
  const { 
    user, 
    projects, 
    deliverables, 
    stats, 
    isLoading, 
    error, 
    refetch 
  } = useClientProjects();
  const { 
    isUpdating, 
    approveDeliverable, 
    requestChanges 
  } = useDeliverables();

  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [changesModalOpen, setChangesModalOpen] = useState(false);
  const [selectedDeliverable, setSelectedDeliverable] = useState<{ id: string; name: string } | null>(null);

  const handleLogout = async () => {
    await authApi.logout();
    router.push('/login');
  };

  const handleApproveClick = (deliverableId: string, deliverableName: string) => {
    setSelectedDeliverable({ id: deliverableId, name: deliverableName });
    setApproveModalOpen(true);
  };

  const handleRequestChangesClick = (deliverableId: string, deliverableName: string) => {
    setSelectedDeliverable({ id: deliverableId, name: deliverableName });
    setChangesModalOpen(true);
  };

  const handleConfirmApprove = async () => {
    if (!selectedDeliverable) return;
    const result = await approveDeliverable(selectedDeliverable.id);
    if (result) {
      setApproveModalOpen(false);
      setSelectedDeliverable(null);
      await refetch();
    }
  };

  const handleConfirmRequestChanges = async (comment: string) => {
    if (!selectedDeliverable) return;
    const result = await requestChanges(selectedDeliverable.id, comment);
    if (result) {
      setChangesModalOpen(false);
      setSelectedDeliverable(null);
      await refetch();
    }
  };

  const getDeliverablesForProject = (projectId: string) => {
    return deliverables.filter(d => d.projectId === projectId);
  };

  const getCompanyName = () => {
    if (!user) return '';
    const firstProject = projects[0];
    if (firstProject && 'client' in firstProject) {
      const client = (firstProject as any).client;
      return client?.company || client?.name || 'Your Company';
    }
    return 'Your Company';
  };

  const getClientName = () => {
    if (!user?.name) return user?.email || '';
    return user.name;
  };

  const getTier = (): 'GOLD' | 'SILVER' | 'BRONZE' => {
    if (stats.totalProjects >= 5) return 'GOLD';
    if (stats.totalProjects >= 2) return 'SILVER';
    return 'BRONZE';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex items-center gap-3 text-white/60">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: PALETTE.pink }} />
          <span className="font-mono text-sm tracking-widest">LOADING PORTAL...</span>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
        <div className="max-w-md w-full border border-white/10 p-8 bg-white/5">
          <div className="flex items-start gap-4" style={{ color: PALETTE.pink }}>
            <AlertTriangle className="w-8 h-8 flex-shrink-0" />
            <div>
              <h2 className="font-bold text-lg mb-2 font-mono">ERROR LOADING PORTAL</h2>
              <p className="text-sm mb-4 text-white/60">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 text-sm font-mono border transition-colors hover:bg-white hover:text-black"
                style={{ borderColor: PALETTE.pink, color: PALETTE.pink }}
              >
                RETRY
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <a href="/" className="flex items-center gap-3">
              <span className="text-xs font-mono tracking-widest text-white/60 hover:text-white transition-colors">
                CREOMOTION
              </span>
              <span className="text-xs font-mono text-white/20">/</span>
              <span className="text-xs font-mono tracking-widest" style={{ color: PALETTE.pink }}>
                CLIENT PORTAL
              </span>
            </a>
            <div className="flex items-center gap-6">
              <span className="text-xs font-mono text-white/40 hidden sm:inline">
                {user?.email}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-xs font-mono border rounded-sm transition-all hover:bg-white hover:text-black"
                style={{ borderColor: PALETTE.pink, color: PALETTE.pink }}
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">SIGN OUT</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 border border-white/10 bg-white/5 text-sm flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: PALETTE.pink }} />
            <span className="text-white/80">{error}</span>
          </div>
        )}

        {/* Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <ClientDashboard
            companyName={getCompanyName()}
            clientName={getClientName()}
            tier={getTier()}
            stats={stats}
          />
        </motion.div>

        {/* Projects Section */}
        <div className="mt-12">
          <div className="flex items-center gap-4 mb-8">
            <FolderKanban className="w-5 h-5" style={{ color: PALETTE.pink }} />
            <h2 className="text-xl font-bold font-mono tracking-widest">
              YOUR PROJECTS
            </h2>
            <span className="px-3 py-1 bg-white/10 text-white/60 text-xs font-mono rounded-sm">
              {projects.length}
            </span>
          </div>

          {projects.length === 0 ? (
            <div className="border border-white/10 bg-white/5 p-12 text-center">
              <FolderKanban className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2 font-mono">NO PROJECTS YET</h3>
              <p className="text-white/40 font-mono text-sm">
                No active projects at the moment.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <ProjectCard
                    project={project}
                    deliverables={getDeliverablesForProject(project.id)}
                    onApproveDeliverable={async (deliverableId) => {
                      const deliverable = deliverables.find(d => d.id === deliverableId);
                      if (deliverable) {
                        handleApproveClick(deliverableId, deliverable.name);
                      }
                    }}
                    onRequestChanges={async (deliverableId) => {
                      const deliverable = deliverables.find(d => d.id === deliverableId);
                      if (deliverable) {
                        handleRequestChangesClick(deliverableId, deliverable.name);
                      }
                    }}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-16 border-t border-white/5 pt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs font-mono text-white/30 tracking-widest">
              CREOMOTION CLIENT PORTAL
            </span>
            <span className="text-xs font-mono text-white/20">
              © {new Date().getFullYear()} All rights reserved
            </span>
          </div>
        </footer>
      </main>

      {/* Modals */}
      <ApproveModal
        isOpen={approveModalOpen}
        deliverableName={selectedDeliverable?.name || ''}
        onConfirm={handleConfirmApprove}
        onCancel={() => {
          setApproveModalOpen(false);
          setSelectedDeliverable(null);
        }}
      />

      <RequestChangesModal
        isOpen={changesModalOpen}
        deliverableName={selectedDeliverable?.name || ''}
        onConfirm={handleConfirmRequestChanges}
        onCancel={() => {
          setChangesModalOpen(false);
          setSelectedDeliverable(null);
        }}
      />
    </div>
  );
}
