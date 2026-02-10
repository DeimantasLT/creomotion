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
import { ProjectCard } from '@/components/portal/ProjectCard';
import { ApproveModal } from '@/components/portal/ApproveModal';
import { RequestChangesModal } from '@/components/portal/RequestChangesModal';
import { useClientProjects } from '@/hooks/useClientProjects';
import { useDeliverables } from '@/hooks/useDeliverables';
import { authApi } from '@/lib/api';

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

  // Modal state
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

  // Group deliverables by project
  const getDeliverablesForProject = (projectId: string) => {
    return deliverables.filter(d => d.projectId === projectId);
  };

  // Get company and client name
  const getCompanyName = () => {
    if (!user) return '';
    // Try to get company from the first project
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

  // Determine tier based on number of projects (demo logic)
  const getTier = (): 'GOLD' | 'SILVER' | 'BRONZE' => {
    if (stats.totalProjects >= 5) return 'GOLD';
    if (stats.totalProjects >= 2) return 'SILVER';
    return 'BRONZE';
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-600">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="mono text-sm">LOADING PORTAL...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !user) {
    return (
      <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center p-6">
        <div className="max-w-md w-full border-2 border-black p-8 bg-white brutalist-shadow">
          <div className="flex items-start gap-4 text-[#FF2E63]">
            <AlertTriangle className="w-8 h-8 flex-shrink-0" />
            <div>
              <h2 className="font-bold text-lg mb-2 mono">ERROR LOADING PORTAL</h2>
              <p className="text-sm mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-black text-white px-4 py-2 text-sm mono hover:bg-[#FF2E63] transition-colors"
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
    <div className="min-h-screen bg-[#F5F5F0]">
      {/* Header */}
      <header className="border-b-2 border-black bg-white sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 border-2 border-black bg-black flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-display text-lg sm:text-xl font-bold">
                  CREO<span className="text-[#FF2E63]">PORTAL</span>
                </h1>
                <p className="text-xs text-gray-500 mono">CLIENT COLLABORATION</p>
              </div>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              <span className="text-sm text-gray-600 mono hidden sm:inline">
                {user?.email}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 border-2 border-black px-3 sm:px-4 py-2 text-xs sm:text-sm mono hover:bg-black hover:text-white transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">SIGN OUT</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 border-2 border-black bg-[#FF2E63] text-white mono text-sm flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
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
        <div className="mt-8">
          <div className="flex items-center gap-3 mb-6">
            <FolderKanban className="w-6 h-6 text-[#FF2E63]" />
            <h2 className="font-display text-xl sm:text-2xl font-bold">
              YOUR PROJECTS
            </h2>
            <span className="px-3 py-1 bg-black text-white text-xs mono">
              {projects.length}
            </span>
          </div>

          {projects.length === 0 ? (
            <div className="border-2 border-black bg-white p-12 text-center">
              <FolderKanban className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">NO PROJECTS YET</h3>
              <p className="text-gray-500 mono text-sm">
                You don&apos;t have any active projects at the moment.
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
        <footer className="mt-12 border-t-2 border-black pt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs mono text-gray-500">
            <span>CREOMOTION CLIENT PORTAL</span>
            <span>© {new Date().getFullYear()} All rights reserved</span>
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
