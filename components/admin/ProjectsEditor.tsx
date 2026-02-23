'use client';

import { useState, useEffect } from 'react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import { Save, RotateCcw, Plus, Trash2, GripVertical, Briefcase, User, Calendar, Tag } from 'lucide-react';
import { useContentSection } from '@/hooks/useContentSection';
import { SHARED } from './shared';

const PALETTE = {
  pink: "#ff006e",
};

interface Project {
  client: string;
  title: string;
  year: string;
  category: string;
}

interface ProjectsEditorProps {
  onSave: () => void;
}

const DEFAULT_PROJECTS: Project[] = [
  { client: 'LRT', title: 'News Rebrand', year: '2024', category: 'Broadcast' },
  { client: 'TV3', title: 'Primetime', year: '2023', category: 'TV' },
  { client: 'LNK', title: 'Show Package', year: '2022', category: 'Broadcast' },
  { client: 'DELFI', title: 'Digital Campaign', year: '2023', category: 'Digital' },
  { client: 'PUMA', title: 'Launch Video', year: '2024', category: 'Commercial' },
  { client: '15min', title: 'Social Content', year: '2023', category: 'Social' },
];

const CATEGORY_OPTIONS = [
  'Broadcast',
  'TV',
  'Digital',
  'Commercial',
  'Social',
  'Branding',
  'Motion',
  'AI',
];

export function ProjectsEditor({ onSave }: ProjectsEditorProps) {
  const { section, data, loading, update } = useContentSection('projects');
  const [projects, setProjects] = useState<Project[]>(DEFAULT_PROJECTS);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) {
      // Handle both array format and { items: [] } format
      const items = Array.isArray(data) ? data : data.items || DEFAULT_PROJECTS;
      setProjects(items);
    }
  }, [data]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save as array of projects for HeroFinal compatibility
      await update(projects);
      onSave();
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (data) {
      const items = Array.isArray(data) ? data : data.items || DEFAULT_PROJECTS;
      setProjects(items);
    } else {
      setProjects(DEFAULT_PROJECTS);
    }
  };

  const addProject = () => {
    const newProject: Project = {
      client: 'New Client',
      title: 'Project Title',
      year: String(new Date().getFullYear()),
      category: 'Digital',
    };
    setProjects([...projects, newProject]);
  };

  const updateProject = (index: number, field: keyof Project, value: string) => {
    const updated = [...projects];
    updated[index] = { ...updated[index], [field]: value };
    setProjects(updated);
  };

  const removeProject = (index: number) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  const setProjectsOrder = (newProjects: Project[]) => {
    setProjects(newProjects);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-white/10 border-t-[#ff006e] rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-xs text-white/40 font-[var(--font-jetbrains-mono)] mb-4">
        Showing {projects.length} projects in the grid
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {projects.map((project, index) => (
            <motion.div
              key={`${project.client}-${index}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white/5 border border-white/10 rounded-sm p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-[var(--font-jetbrains-mono)] text-white/40">
                  PROJECT {index + 1}
                </span>
                <button
                  onClick={() => removeProject(index)}
                  className="text-white/20 hover:text-[#ff006e] transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="w-3 h-3 text-[#ff006e]" />
                  <input
                    type="text"
                    value={project.client}
                    onChange={(e) => updateProject(index, 'client', e.target.value)}
                    placeholder="Client (e.g., LRT)"
                    className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-sm
                             text-white text-sm placeholder:text-white/20
                             focus:border-[#ff006e] focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Briefcase className="w-3 h-3 text-[#ff006e]" />
                  <input
                    type="text"
                    value={project.title}
                    onChange={(e) => updateProject(index, 'title', e.target.value)}
                    placeholder="Project Title"
                    className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-sm
                             text-white text-sm placeholder:text-white/20
                             focus:border-[#ff006e] focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3 text-[#ff006e]" />
                  <input
                    type="text"
                    value={project.year}
                    onChange={(e) => updateProject(index, 'year', e.target.value)}
                    placeholder="Year (e.g., 2024)"
                    className="w-24 px-3 py-2 bg-white/5 border border-white/10 rounded-sm
                             text-white text-sm text-center placeholder:text-white/20
                             focus:border-[#ff006e] focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Tag className="w-3 h-3 text-[#ff006e]" />
                  <select
                    value={project.category}
                    onChange={(e) => updateProject(index, 'category', e.target.value)}
                    className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-sm
                             text-white text-sm
                             focus:border-[#ff006e] focus:outline-none"
                  >
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <button
        onClick={addProject}
        className="w-full py-4 border border-dashed border-white/20 rounded-sm
                 text-white/40 hover:text-white hover:border-white/40 transition-colors
                 font-[var(--font-jetbrains-mono)] text-xs tracking-widest"
      >
        <Plus className="w-4 h-4 inline-block mr-2" />
        ADD PROJECT
      </button>

      <div className="flex items-center gap-4 pt-4 border-t border-white/10">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 font-[var(--font-jetbrains-mono)] 
                   text-xs tracking-widest rounded-sm transition-all disabled:opacity-50
                   min-h-[44px]"
          style={{ backgroundColor: PALETTE.pink, color: '#0a0a0a' }}
        >
          <Save className="w-4 h-4" />
          {saving ? 'SAVING...' : 'SAVE CHANGES'}
        </button>

        <button
          onClick={handleReset}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-3 font-[var(--font-jetbrains-mono)] 
                   text-xs tracking-widest text-white/60 hover:text-white transition-colors
                   min-h-[44px]"
        >
          <RotateCcw className="w-4 h-4" />
          RESET
        </button>
      </div>
    </div>
  );
}

export default ProjectsEditor;
