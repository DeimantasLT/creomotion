'use client';

import { useState, useEffect } from 'react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import { Save, RotateCcw, Plus, Trash2, GripVertical, Calendar } from 'lucide-react';
import { useContentSection } from '@/hooks/useContentSection';
import { SHARED } from './shared';

const PALETTE = {
  pink: "#ff006e",
};

interface TimelineItem {
  year: string;
  label: string;
}

interface AboutData {
  pretitle: string;
  title1: string;
  title2: string;
  description: string;
  timeline: TimelineItem[];
}

interface AboutEditorProps {
  onSave: () => void;
}

const DEFAULT_ABOUT_DATA: AboutData = {
  pretitle: 'ABOUT',
  title1: 'From TV studios',
  title2: 'to AI power',
  description: '16 years crafting motion graphics for Lithuania\'s biggest TV channels. Now embracing AI to push creative boundaries further.',
  timeline: [
    { year: '2008', label: 'Started' },
    { year: '2012', label: 'Evolution' },
    { year: '2016', label: 'Growth' },
    { year: '2020', label: 'Expansion' },
    { year: '2024', label: 'AI Era' },
  ],
};

export function AboutEditor({ onSave }: AboutEditorProps) {
  const { section, data, loading, update } = useContentSection('about');
  const [formData, setFormData] = useState<AboutData>(DEFAULT_ABOUT_DATA);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) {
      setFormData({
        ...DEFAULT_ABOUT_DATA,
        ...data,
        timeline: data.timeline || DEFAULT_ABOUT_DATA.timeline,
      });
    }
  }, [data]);

  const handleChange = (field: keyof AboutData, value: string) => {
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
        ...DEFAULT_ABOUT_DATA,
        ...data,
        timeline: data.timeline || DEFAULT_ABOUT_DATA.timeline,
      });
    } else {
      setFormData(DEFAULT_ABOUT_DATA);
    }
  };

  const addTimelineItem = () => {
    const newItem: TimelineItem = {
      year: String(new Date().getFullYear()),
      label: 'New Milestone',
    };
    setFormData((prev) => ({
      ...prev,
      timeline: [...prev.timeline, newItem],
    }));
  };

  const updateTimelineItem = (index: number, field: keyof TimelineItem, value: string) => {
    setFormData((prev) => {
      const updated = [...prev.timeline];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, timeline: updated };
    });
  };

  const removeTimelineItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      timeline: prev.timeline.filter((_, i) => i !== index),
    }));
  };

  const setTimeline = (timeline: TimelineItem[]) => {
    setFormData((prev) => ({ ...prev, timeline }));
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
      {/* Header Text Fields */}
      <div className="space-y-4">
        <SHARED.Input
          label="Pretitle"
          value={formData.pretitle}
          onChange={(value) => handleChange('pretitle', value)}
          placeholder="e.g., ABOUT"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SHARED.Input
            label="Title Line 1"
            value={formData.title1}
            onChange={(value) => handleChange('title1', value)}
            placeholder="e.g., From TV studios"
          />
          <SHARED.Input
            label="Title Line 2 (Accent Color)"
            value={formData.title2}
            onChange={(value) => handleChange('title2', value)}
            placeholder="e.g., to AI power"
          />
        </div>

        <SHARED.TextArea
          label="Description"
          value={formData.description}
          onChange={(value) => handleChange('description', value)}
          placeholder="Tell your story..."
          rows={4}
        />
      </div>

      {/* Timeline Section */}
      <div className="space-y-4 pt-4 border-t border-white/10">
        <label className="block text-xs font-[var(--font-jetbrains-mono)] text-white/60 tracking-wider">
          TIMELINE
        </label>
        
        <Reorder.Group axis="y" values={formData.timeline} onReorder={setTimeline} className="space-y-3">
          <AnimatePresence>
            {formData.timeline.map((item, index) => (
              <Reorder.Item
                key={`${item.year}-${index}`}
                value={item}
                className="bg-white/5 border border-white/10 rounded-sm p-4"
              >
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-4"
                >
                  <GripVertical className="w-5 h-5 text-white/20 cursor-grab flex-shrink-0" />
                  <Calendar className="w-4 h-4 text-[#ff006e] flex-shrink-0" />
                  
                  <div className="flex-1 grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={item.year}
                      onChange={(e) => updateTimelineItem(index, 'year', e.target.value)}
                      placeholder="Year (e.g., 2024)"
                      className="px-3 py-2 bg-white/5 border border-white/10 rounded-sm
                               text-white text-sm placeholder:text-white/20
                               focus:border-[#ff006e] focus:outline-none"
                    />
                    <input
                      type="text"
                      value={item.label}
                      onChange={(e) => updateTimelineItem(index, 'label', e.target.value)}
                      placeholder="Label (e.g., Started)"
                      className="px-3 py-2 bg-white/5 border border-white/10 rounded-sm
                               text-white text-sm placeholder:text-white/20
                               focus:border-[#ff006e] focus:outline-none"
                    />
                  </div>

                  <button
                    onClick={() => removeTimelineItem(index)}
                    className="text-white/20 hover:text-[#ff006e] transition-colors flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              </Reorder.Item>
            ))}
          </AnimatePresence>
        </Reorder.Group>

        <button
          onClick={addTimelineItem}
          className="w-full py-4 border border-dashed border-white/20 rounded-sm
                   text-white/40 hover:text-white hover:border-white/40 transition-colors
                   font-[var(--font-jetbrains-mono)] text-xs tracking-widest"
        >
          <Plus className="w-4 h-4 inline-block mr-2" />
          ADD TIMELINE ITEM
        </button>
      </div>

      {/* Action Buttons */}
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

export default AboutEditor;
