'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Clock,
  FileText,
  LogOut,
  Plus,
  AlertCircle,
} from 'lucide-react';

// Components
import TimeTracker from '@/components/admin/TimeTracker';
import ProjectList from '@/components/admin/ProjectList';
import ClientList from '@/components/admin/ClientList';
import StatsCards from '@/components/admin/StatsCards';
import ProjectTable from '@/components/admin/ProjectTable';
import CreateProjectModal from '@/components/admin/CreateProjectModal';
import CreateClientModal from '@/components/admin/CreateClientModal';
import EditProjectModal from '@/components/admin/EditProjectModal';
import EditClientModal from '@/components/admin/EditClientModal';

// Hooks
import { useProjects } from '@/hooks/useProjects';
import { useClients } from '@/hooks/useClients';

// Types
import type { Project, Client } from '@/types';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface ProjectWithClient extends Project {
  client?: {
    id: string;
    name: string;
    email: string;
    company?: string;
  };
  _count?: {
    timeEntries: number;
    invoices: number;
  };
}

interface ClientWithCounts extends Client {
  _count?: {
    projects: number;
    invoices: number;
  };
}

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Refresh trigger
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Modals state
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isCreateClientOpen, setIsCreateClientOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectWithClient | null>(null);
  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientWithCounts | null>(null);
  const [isEditClientOpen, setIsEditClientOpen] = useState(false);

  // Data hooks
  const {
    projects,
    loading: projectsLoading,
    error: projectsError,
    createProject,
    updateProject,
    deleteProject,
  } = useProjects({ refreshTrigger });

  const {
    clients,
    loading: clientsLoading,
    error: clientsError,
    createClient,
    updateClient,
    deleteClient,
  } = useClients({ refreshTrigger });

  // Auth check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (!response.ok) {
          router.push('/login');
          return;
        }
        const data = await response.json();
        setUser(data.user);
      } catch {
        router.push('/login');
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  // Handle refresh
  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  // Logout
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Project handlers
  const handleCreateProject = async (data: {
    name: string;
    description: string;
    clientId: string;
    status: string;
    budget: number | null;
    deadline: string | null;
  }) => {
    await createProject(data);
    handleRefresh();
  };

  const handleEditProject = (project: ProjectWithClient) => {
    setEditingProject(project);
    setIsEditProjectOpen(true);
  };

  const handleUpdateProject = async (
    id: string,
    data: {
      name?: string;
      description?: string;
      clientId?: string;
      status?: string;
      budget?: number;
      deadline?: string;
    }
  ) => {
    await updateProject(id, data);
    handleRefresh();
  };

  const handleDeleteProject = async (id: string) => {
    await deleteProject(id);
    handleRefresh();
  };

  // Client handlers
  const handleCreateClient = async (data: {
    name: string;
    email: string;
    company: string;
    phone: string;
  }) => {
    await createClient(data);
    handleRefresh();
  };

  const handleEditClient = (client: ClientWithCounts) => {
    setEditingClient(client);
    setIsEditClientOpen(true);
  };

  const handleUpdateClient = async (
    id: string,
    data: {
      name?: string;
      email?: string;
      company?: string;
      phone?: string;
    }
  ) => {
    await updateClient(id, data);
    handleRefresh();
  };

  const handleDeleteClient = async (id: string) => {
    await deleteClient(id);
    handleRefresh();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-black border-t-[#FF2E63] rounded-full mx-auto mb-4" />
          <p className="font-mono text-sm">[LOADING...]</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'time', label: 'Time Tracking', icon: Clock },
    { id: 'invoices', label: 'Invoices', icon: FileText },
  ];

  return (
    <div
      className="min-h-screen bg-[#F5F5F0]"
      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
    >
      {/* Modals */}
      <CreateProjectModal
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
        onSubmit={handleCreateProject}
        clients={clients}
      />

      <CreateClientModal
        isOpen={isCreateClientOpen}
        onClose={() => setIsCreateClientOpen(false)}
        onSubmit={handleCreateClient}
      />

      <EditProjectModal
        isOpen={isEditProjectOpen}
        onClose={() => {
          setIsEditProjectOpen(false);
          setEditingProject(null);
        }}
        onSubmit={handleUpdateProject}
        onDelete={handleDeleteProject}
        project={editingProject}
        clients={clients}
      />

      <EditClientModal
        isOpen={isEditClientOpen}
        onClose={() => {
          setIsEditClientOpen(false);
          setEditingClient(null);
        }}
        onSubmit={handleUpdateClient}
        onDelete={handleDeleteClient}
        client={editingClient}
      />

      {/* Header */}
      <header className="border-b-2 border-black bg-white sticky top-0 z-40">
        <div className="flex items-center justify-between px-6 h-16">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-2xl font-bold tracking-tighter">
              <span className="text-black">CREO</span>
              <span className="text-[#FF2E63]">MOTION</span>
            </Link>
            <span
              className="text-xs font-mono bg-black text-white px-2 py-1 uppercase tracking-wider"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {user.role}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span
              className="text-sm hidden sm:block"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {user.name}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm hover:text-[#FF2E63] transition-colors px-3 py-2 border-2 border-transparent hover:border-[#FF2E63]"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r-2 border-black bg-white min-h-[calc(100vh-64px)] hidden lg:block">
          <nav className="p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left border-2 transition-all ${
                    activeTab === item.id
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-black border-transparent hover:border-black'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t-2 border-black">
            <button
              onClick={() => setIsCreateProjectOpen(true)}
              className="w-full flex items-center justify-center gap-2 bg-[#FF2E63] text-white border-2 border-[#FF2E63] px-4 py-3 font-bold uppercase text-sm hover:bg-black hover:border-black transition-colors"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              <Plus className="w-4 h-4" />
              New Project
            </button>
          </div>
        </aside>

        {/* Mobile Nav */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 border-t-2 border-black bg-white z-40">
          <nav className="flex justify-around p-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex flex-col items-center gap-1 p-2 ${
                    activeTab === item.id ? 'text-[#FF2E63]' : 'text-black'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8 pb-24 lg:pb-8">
          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Stats */}
              <StatsCards refreshTrigger={refreshTrigger} />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Time Tracker */}
                <TimeTracker
                  refreshTrigger={refreshTrigger}
                  onEntryCreated={handleRefresh}
                />

                {/* Recent Projects */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2
                      className="text-xl font-bold"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      Recent Projects
                    </h2>
                    <button
                      onClick={() => setActiveTab('projects')}
                      className="text-sm text-[#FF2E63] hover:underline"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      View All →
                    </button>
                  </div>
                  <ProjectTable
                    limit={5}
                    refreshTrigger={refreshTrigger}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* PROJECTS TAB */}
          {activeTab === 'projects' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2
                  className="text-2xl font-bold"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Projects
                </h2>
                <button
                  onClick={() => setIsCreateProjectOpen(true)}
                  className="border-2 border-black bg-[#FF2E63] text-white px-4 py-2 font-bold text-sm tracking-wider flex items-center gap-2 hover:bg-black transition-colors"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  <Plus className="w-4 h-4" />
                  NEW PROJECT
                </button>
              </div>

              <ProjectList
                projects={projects}
                loading={projectsLoading}
                error={projectsError}
                onEdit={handleEditProject}
                onCreate={() => setIsCreateProjectOpen(true)}
              />
            </motion.div>
          )}

          {/* CLIENTS TAB */}
          {activeTab === 'clients' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2
                  className="text-2xl font-bold"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Clients
                </h2>
                <button
                  onClick={() => setIsCreateClientOpen(true)}
                  className="border-2 border-black bg-[#FF2E63] text-white px-4 py-2 font-bold text-sm tracking-wider flex items-center gap-2 hover:bg-black transition-colors"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  <Plus className="w-4 h-4" />
                  NEW CLIENT
                </button>
              </div>

              <ClientList
                clients={clients}
                loading={clientsLoading}
                error={clientsError}
                onEdit={handleEditClient}
                onCreate={() => setIsCreateClientOpen(true)}
              />
            </motion.div>
          )}

          {/* TIME TAB */}
          {activeTab === 'time' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2
                  className="text-2xl font-bold"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Time Tracking
                </h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <TimeTracker
                  refreshTrigger={refreshTrigger}
                  onEntryCreated={handleRefresh}
                />
                <StatsCards
                  refreshTrigger={refreshTrigger}
                  detailed={true}
                />
              </div>
            </motion.div>
          )}

          {/* INVOICES TAB */}
          {activeTab === 'invoices' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <h2
                className="text-2xl font-bold"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Invoices
              </h2>
              <div
                className="border-2 border-black bg-white p-12 text-center"
                style={{ boxShadow: '4px 4px 0 0 #000' }}
              >
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p
                  className="text-gray-600"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  Invoice management coming soon
                </p>
              </div>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}
