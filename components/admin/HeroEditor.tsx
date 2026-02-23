'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, RotateCcw, Plus, Trash2 } from 'lucide-react';
import { useContentSection } from '@/hooks/useContentSection';
import { SHARED } from './shared';

const PALETTE = {
  pink: "#ff006e",
};

interface HeroEditorProps {
  onSave: () => void;
}

// Matches HeroFinal expected format
const DEFAULT_HERO_DATA = {
  year: 'EST. 2008 — 16 YEARS',
  headline1: 'CREO',
  headline2: 'MOTION',
  tagline: ['BROADCAST TV', 'AI VIDEO', 'MOTION DESIGN'],
  description: 'Creating memorable visual experiences for TV and digital brands. From Lithuanian broadcast to AI-powered content.',
  stats: [
    { num: '200+', label: 'Projects' },
    { num: '16', label: 'Years' },
    { num: '24h', label: 'Delivery' }
  ]
};

export function HeroEditor({ onSave }: HeroEditorProps) {
  const { section, data, loading, update } = useContentSection('hero');
  const [formData, setFormData] = useState(DEFAULT_HERO_DATA);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) {
      setFormData({ ...DEFAULT_HERO_DATA, ...data });
    }
  }, [data]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleStatChange = (index: number, field: 'num' | 'label', value: string) => {
    setFormData((prev) => ({
      ...prev,
      stats: prev.stats.map((s, i) => i === index ? { ...s, [field]: value } : s)
    }));
  };

  const handleTaglineChange = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      tagline: prev.tagline.map((t, i) => i === index ? value : t)
    }));
  };

  const addTagline = () => {
    setFormData((prev) => ({ ...prev, tagline: [...prev.tagline, 'NEW TAG'] }));
  };

  const removeTagline = (index: number) => {
    setFormData((prev) => ({ ...prev, tagline: prev.tagline.filter((_, i) => i !== index) }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await update(formData);
      onSave();
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (data) {
      setFormData({ ...DEFAULT_HERO_DATA, ...data });
    } else {
      setFormData(DEFAULT_HERO_DATA);
    }
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <SHARED.Input
            label="Year Label"
            value={formData.year}
            onChange={(value) => handleChange('year', value)}
            placeholder="e.g., EST. 2008 — 16 YEARS"
          />
          
          <div className="grid grid-cols-2 gap-4">
            <SHARED.Input
              label="Headline Line 1"
              value={formData.headline1}
              onChange={(value) => handleChange('headline1', value)}
              placeholder="e.g., CREO"
            />
            <SHARED.Input
              label="Headline Line 2"
              value={formData.headline2}
              onChange={(value) => handleChange('headline2', value)}
              placeholder="e.g., MOTION"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-[var(--font-jetbrains-mono)] text-white/40 tracking-widest">
              TAGLINES
            </label>
            {formData.tagline.map((tag, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  value={tag}
                  onChange={(e) => handleTaglineChange(i, e.target.value)}
                  className="flex-1 bg-[#1a1a1a] border border-white/10 rounded-sm px-3 py-2 text-white text-sm font-[var(--font-space-grotesk)] focus:border-[#ff006e] focus:outline-none transition-colors min-h-[44px]"
                />
                <button
                  onClick={() => removeTagline(i)}
                  className="p-2 text-white/40 hover:text-red-400 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              onClick={addTagline}
              className="flex items-center gap-2 text-xs text-white/40 hover:text-white transition-colors py-2"
            >
              <Plus className="w-4 h-4" />
              Add Tagline
            </button>
          </div>

          <SHARED.TextArea
            label="Description"
            value={formData.description}
            onChange={(value) => handleChange('description', value)}
            placeholder="Brief description..."
            rows={3}
          />
        </div>
                
        <div className="space-y-4">
          <span className="text-xs font-[var(--font-jetbrains-mono)] text-white/40 tracking-widest">
            STATS
          </span>
          {formData.stats.map((stat, i) => (
            <div key={i} className="grid grid-cols-2 gap-4">
              <SHARED.Input
                label={`Stat ${i + 1} Number`}
                value={stat.num}
                onChange={(value) => handleStatChange(i, 'num', value)}
                placeholder="e.g., 200+"
              />
              <SHARED.Input
                label={`Stat ${i + 1} Label`}
                value={stat.label}
                onChange={(value) => handleStatChange(i, 'label', value)}
                placeholder="e.g., Projects"
              />
            </div>
          ))}

          <div className="p-4 bg-[#141414] border border-white/10 rounded-sm">
            <span className="text-xs font-[var(--font-jetbrains-mono)] text-white/40 tracking-widest">
              PREVIEW
            </span>
            <div className="mt-4 space-y-2 text-center">
              <p className="text-xs text-white/40 tracking-widest font-[var(--font-jetbrains-mono)]">
                {formData.year}
              </p>
              <h1 className="text-4xl md:text-5xl font-black text-white leading-[0.9] tracking-tight">
                {formData.headline1}
                <br />
                {formData.headline2}
              </h1>
              <div className="flex justify-center gap-4 mt-2">
                {formData.tagline.map((t, i) => (
                  <span key={i} className="text-xs text-white/40 tracking-widest font-[var(--font-space-grotesk)]">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
            
      <div className="flex items-center gap-4 pt-4 border-t border-white/10">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 font-[var(--font-jetbrains-mono)] text-xs tracking-widest rounded-sm transition-all disabled:opacity-50 min-h-[44px]"
          style={{ backgroundColor: PALETTE.pink, color: '#0a0a0a' }}
        >
          <Save className="w-4 h-4" />
          {saving ? 'SAVING...' : 'SAVE CHANGES'}
        </button>
        <button
          onClick={handleReset}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-3 font-[var(--font-jetbrains-mono)] text-xs tracking-widest text-white/60 hover:text-white transition-colors min-h-[44px]"
        >
          <RotateCcw className="w-4 h-4" />
          RESET
        </button>
      </div>
    </div>
  );
}

export default HeroEditor;
