'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, RotateCcw, Search, Image, FileText, Type, Hash } from 'lucide-react';
import { useContentSection } from '@/hooks/useContentSection';
import { SHARED } from './shared';

const PALETTE = {
  pink: "#ff006e",
};

interface SEOData {
  title: string;
  description: string;
  keywords: string;
  ogImage: string;
}

interface SEOEditorProps {
  onSave: () => void;
}

const DEFAULT_SEO_DATA: SEOData = {
  title: 'CreaMotion - Creative Motion Design Studio',
  description: 'Premium motion design services for broadcast, digital, and brand storytelling.',
  keywords: 'motion design, video production, animation, creative agency',
  ogImage: '',
};

export function SEOEditor({ onSave }: SEOEditorProps) {
  const { section, data, loading, update } = useContentSection('seo');
  const [formData, setFormData] = useState<SEOData>(DEFAULT_SEO_DATA);
  const [saving, setSaving] = useState(false);
  const [charCounts, setCharCounts] = useState({
    title: 0,
    description: 0,
  });

  useEffect(() => {
    if (data) {
      setFormData({
        ...DEFAULT_SEO_DATA,
        ...data,
      });
    }
  }, [data]);

  useEffect(() => {
    setCharCounts({
      title: formData.title.length,
      description: formData.description.length,
    });
  }, [formData]);

  const handleChange = (field: keyof SEOData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
      setFormData({
        ...DEFAULT_SEO_DATA,
        ...data,
      });
    } else {
      setFormData(DEFAULT_SEO_DATA);
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
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-[#ff006e]" />
            <label className="block text-xs font-[var(--font-jetbrains-mono)] text-white/60 tracking-wider">
              PAGE TITLE
            </label>
          </div>
          <SHARED.Input
            label=""
            value={formData.title}
            onChange={(value) => handleChange('title', value)}
            placeholder="e.g., CreaMotion - Creative Motion Design Studio"
          />
          <div className="flex justify-between text-xs">
            <span className="text-white/40">
              Recommended: 50-60 characters
            </span>
            <span className={charCounts.title > 60 ? 'text-[#ff006e]' : 'text-white/40'}>
              {charCounts.title} chars
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#ff006e]" />
            <label className="block text-xs font-[var(--font-jetbrains-mono)] text-white/60 tracking-wider">
              META DESCRIPTION
            </label>
          </div>
          <SHARED.TextArea
            label=""
            value={formData.description}
            onChange={(value) => handleChange('description', value)}
            placeholder="Brief description of your page for search engines..."
            rows={3}
          />
          <div className="flex justify-between text-xs">
            <span className="text-white/40">
              Recommended: 150-160 characters
            </span>
            <span className={charCounts.description > 160 ? 'text-[#ff006e]' : 'text-white/40'}>
              {charCounts.description} chars
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-[#ff006e]" />
            <label className="block text-xs font-[var(--font-jetbrains-mono)] text-white/60 tracking-wider">
              KEYWORDS
            </label>
          </div>
          <SHARED.Input
            label=""
            value={formData.keywords}
            onChange={(value) => handleChange('keywords', value)}
            placeholder="motion design, video production, animation..."
          />
          <p className="text-xs text-white/40">
            Comma-separated list of keywords for SEO
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Image className="w-4 h-4 text-[#ff006e]" />
            <label className="block text-xs font-[var(--font-jetbrains-mono)] text-white/60 tracking-wider">
              OG IMAGE URL
            </label>
          </div>
          <SHARED.Input
            label=""
            value={formData.ogImage}
            onChange={(value) => handleChange('ogImage', value)}
            placeholder="https://example.com/og-image.jpg"
            type="url"
          />
          <p className="text-xs text-white/40">
            Image displayed when sharing on social media (1200x630px recommended)
          </p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white/5 border border-white/10 rounded-sm p-4 space-y-2"
      >
        <h4 className="text-xs font-[var(--font-jetbrains-mono)] text-white/60 tracking-wider">
          PREVIEW
        </h4>
        <div className="bg-[#F5F5F0] rounded-sm p-4">
          <p className="text-[#1a0dab] text-sm font-medium truncate">
            {formData.title || 'Page Title'}
          </p>
          <p className="text-[#006621] text-xs">
            www.example.com
          </p>
          <p className="text-[#545454] text-xs line-clamp-2">
            {formData.description || 'Meta description preview...'}
          </p>
        </div>
      </motion.div>

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

export default SEOEditor;
