'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, RotateCcw, Mail } from 'lucide-react';
import { useContentSection } from '@/hooks/useContentSection';
import { SHARED } from './shared';

const PALETTE = {
  pink: "#ff006e",
};

interface ContactData {
  pretitle: string;
  title1: string;
  title2: string;
  description: string;
  cta: string;
  email: string;
}

interface ContactEditorProps {
  onSave: () => void;
}

const DEFAULT_CONTACT_DATA: ContactData = {
  pretitle: "LET'S CONNECT",
  title1: 'Start your',
  title2: 'next project',
  description: 'Ready to bring your vision to life? Let\'s create something extraordinary together.',
  cta: 'Get in Touch',
  email: 'hello@creomotion.lt',
};

export function ContactEditor({ onSave }: ContactEditorProps) {
  const { section, data, loading, update } = useContentSection('contact');
  const [formData, setFormData] = useState<ContactData>(DEFAULT_CONTACT_DATA);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) {
      setFormData({
        ...DEFAULT_CONTACT_DATA,
        ...data,
      });
    }
  }, [data]);

  const handleChange = (field: keyof ContactData, value: string) => {
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
        ...DEFAULT_CONTACT_DATA,
        ...data,
      });
    } else {
      setFormData(DEFAULT_CONTACT_DATA);
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
        <SHARED.Input
          label="Pretitle"
          value={formData.pretitle}
          onChange={(value) => handleChange('pretitle', value)}
          placeholder="e.g., LET'S CONNECT"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SHARED.Input
            label="Title Line 1"
            value={formData.title1}
            onChange={(value) => handleChange('title1', value)}
            placeholder="e.g., Start your"
          />
          <SHARED.Input
            label="Title Line 2 (Accent Color)"
            value={formData.title2}
            onChange={(value) => handleChange('title2', value)}
            placeholder="e.g., next project"
          />
        </div>

        <SHARED.TextArea
          label="Description"
          value={formData.description}
          onChange={(value) => handleChange('description', value)}
          placeholder="Description text..."
          rows={3}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/10">
          <SHARED.Input
            label="CTA Button Text"
            value={formData.cta}
            onChange={(value) => handleChange('cta', value)}
            placeholder="e.g., Get in Touch"
          />
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <SHARED.Input
                label="Email Address"
                value={formData.email}
                onChange={(value) => handleChange('email', value)}
                placeholder="e.g., hello@creomotion.lt"
                type="email"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-sm">
        <h4 className="text-xs font-[var(--font-jetbrains-mono)] text-white/40 mb-4 tracking-wider">
          PREVIEW
        </h4>
        <div className="text-center">
          <span className="text-xs font-mono tracking-[0.3em] text-white/30 block mb-4">
            {formData.pretitle}
          </span>
          <h2 className="text-2xl font-bold mb-2">
            {formData.title1}
            <span className="block" style={{ color: PALETTE.pink }}>
              {formData.title2}
            </span>
          </h2>
          <p className="text-white/50 text-sm mb-4 max-w-md mx-auto">
            {formData.description}
          </p>
          <div className="inline-block px-4 py-2 text-sm font-bold rounded-full"
               style={{ backgroundColor: PALETTE.pink, color: '#0a0a0a' }}>
            {formData.cta}
          </div>
          <div className="mt-3 text-xs text-white/30 font-mono">
            {formData.email}
          </div>
        </div>
      </div>

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

export default ContactEditor;
