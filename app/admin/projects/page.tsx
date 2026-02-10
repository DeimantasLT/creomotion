'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { ProjectList } from '@/components/admin';
import { CreateProjectModal, EditProjectModal } from '@/components/admin';
import { useProjects } from '@/hooks/useProjects';
import type { Project } from '@/types';

interface JWTPayload {
  userId: string;
  email: string;
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

function withAuth(Component: React.ComponentType) {
  return function AuthenticatedComponent() {
    const [user, setUser] = useState<JWTPayload | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
      const checkAuth = async () => {
        try {
          const response = await fetch('/api/auth/me');
          if (!response.ok) throw new Error('Not authenticated');
          const data = await response.json();
          setUser(data.user);
        } catch {
          router.push('/login');
        } finally {
          setIsLoading(false);
        }
      };
      checkAuth();
    }, [router]);

    if (isLoading) {
      return (
        <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-black border-t-[#FF2E63] animate-spin" />
        </div>
      );
    }

    if (!user) return null;
    return <Component />;
  };
}

function AdminSidebar() {
  const menuItems = [
    { id: 'dashboard', label: 'DASHBOARD', href: '/admin', icon: '□' },
    { id: 'projects', label: 'PROJECTS', href: '/admin/projects', icon: '◈' },
    { id: 'clients', label: 'CLIENTS', href: '/admin/clients', icon: '⊙' },
    { id: 'time', label: 'TIME', href: '/admin/time-invoicing', icon: '◷' },
    { id: 'invoices', label: 'INVOICES', href: '/admin/invoices', icon: '⧉' },
  ];

  return (
    <aside className="w-64 bg-black text-[#F5F5F0] min-h-screen flex flex-col">
      <div className="p-6 border-b-2 border-[#F5F5F0]/20">
        <Link href="/" className="text-xl font-bold tracking-tighter" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          <span className="text-[#F5F5F0]">CREO</span>
          <span className="text-[#FF2E63]">MOTION</span>
        </Link>
        <p className="text-xs text-[#F5F5F0]/40 mt-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>ADMIN</p>
      </div>

      <nav className="flex-1 py-6">
        {menuItems.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={`flex items-center gap-4 px-6 py-4 transition-colors ${
              item.id === 'projects' ? 'bg-[#FF2E63] text-white' : 'hover:bg-[#F5F5F0]/10 text-[#F5F5F0]/80'
            }`}
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="text-sm tracking-wider">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-6 border-t-2 border-[#F5F5F0]/20">
        <button
          onClick={async () => {
            await fetch('/api/auth/logout', { method: 'POST' });
            window.location.href = '/login';
          }}
          className="w-full py-3 border-2 border-[#F5F5F0]/20 text-sm tracking-wider hover:bg-[#FF2E63] hover:border-[#FF2E63] transition-colors"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          LOGOUT
        </button>
      </div>
    </aside>
  );
}

function ProjectsPageContent() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectWithClient | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const {
    projects,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
  } = useProjects({ refreshTrigger });

  // Get clients for the modals
  const [clients, setClients] = useState<Array<{ id: string; name: string; company?: string }>>([]);

  useEffect(() => {
    fetch('/api/clients')
      .then(res => res.json())
      .then(data => setClients(data.clients || []))
      .catch(console.error);
  }, []);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleCreate = async (data: {
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

  const handleEdit = (project: ProjectWithClient) => {
    setEditingProject(project);
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (
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

  const handleDelete = async (id: string) => {
    await deleteProject(id);
    handleRefresh();
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] flex">
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreate}
        clients={clients}
      />

      <EditProjectModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingProject(null);
        }}
        onSubmit={handleUpdate}
        onDelete={handleDelete}
        project={editingProject}
        clients={clients}
      />

      <AdminSidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <motion.div className="mb-8 flex items-center justify-between" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div>
            <p className="text-xs tracking-[0.2em] text-[#FF2E63] mb-2" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              [PROJECTS]
            </p>
            <h1 className="text-4xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              ALL PROJECTS
            </h1>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="border-2 border-black bg-[#FF2E63] text-white px-4 py-2 font-bold text-sm tracking-wider flex items-center gap-2 hover:bg-black transition-colors"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            <Plus className="w-4 h-4" />
            NEW PROJECT
          </button>
        </motion.div>

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <ProjectList
            projects={projects}
            loading={loading}
            error={error}
            onEdit={handleEdit}
            onCreate={() => setIsCreateModalOpen(true)}
          />
        </motion.section>
      </main>
    </div>
  );
}

export default withAuth(ProjectsPageContent);
