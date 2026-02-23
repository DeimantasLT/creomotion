'use client';

import { useState, useEffect } from 'react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import { Save, RotateCcw, Plus, Trash2, GripVertical, Quote } from 'lucide-react';
import { useContentSection } from '@/hooks/useContentSection';
import { SHARED } from './shared';

const PALETTE = {
  pink: "#ff006e",
};

interface TestimonialItem {
  id: string;
  name: string;
  company: string;
  quote: string;
  tier?: 'GOLD' | 'SILVER' | 'BRONZE';
}

interface TestimonialsData {
  title: string;
  subtitle: string;
  items: TestimonialItem[];
}

interface TestimonialsEditorProps {
  onSave: () => void;
}

const DEFAULT_TESTIMONIALS_DATA: TestimonialsData = {
  title: 'Client Stories',
  subtitle: 'What our clients say about working with us',
  items: [
    {
      id: '1',
      name: 'Sarah Chen',
      company: 'TechCorp',
      quote: 'Working with this team was an absolute pleasure. The quality of work exceeded our expectations.',
      tier: 'GOLD',
    },
    {
      id: '2',
      name: 'Marcus Johnson',
      company: 'Media Studios',
      quote: 'The motion design they created for our broadcast campaign was phenomenal.',
      tier: 'SILVER',
    },
  ],
};

export function TestimonialsEditor({ onSave }: TestimonialsEditorProps) {
  const { section, data, loading, update } = useContentSection('testimonials');
  const [formData, setFormData] = useState<TestimonialsData>(DEFAULT_TESTIMONIALS_DATA);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) {
      setFormData({
        ...DEFAULT_TESTIMONIALS_DATA,
        ...data,
        items: data.items?.map((item: TestimonialItem, i: number) => ({
          ...item,
          id: item.id || String(i + 1),
        })) || DEFAULT_TESTIMONIALS_DATA.items,
      });
    }
  }, [data]);

  const handleChange = (field: keyof TestimonialsData, value: string) => {
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
        ...DEFAULT_TESTIMONIALS_DATA,
        ...data,
        items: data.items?.map((item: TestimonialItem, i: number) => ({
          ...item,
          id: item.id || String(i + 1),
        })) || DEFAULT_TESTIMONIALS_DATA.items,
      });
    } else {
      setFormData(DEFAULT_TESTIMONIALS_DATA);
    }
  };

  const addTestimonial = () => {
    const newItem: TestimonialItem = {
      id: Date.now().toString(),
      name: '',
      company: '',
      quote: '',
      tier: 'BRONZE',
    };
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  const updateTestimonial = (index: number, field: keyof TestimonialItem, value: any) => {
    setFormData((prev) => {
      const updated = [...prev.items];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, items: updated };
    });
  };

  const removeTestimonial = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const setItems = (items: TestimonialItem[]) => {
    setFormData((prev) => ({ ...prev, items }));
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
          label="Section Title"
          value={formData.title}
          onChange={(value) => handleChange('title', value)}
          placeholder="e.g., Client Stories"
        />

        <SHARED.Input
          label="Section Subtitle"
          value={formData.subtitle}
          onChange={(value) => handleChange('subtitle', value)}
          placeholder="e.g., What our clients say about working with us"
        />
      </div>

      <div className="space-y-4">
        <label className="block text-xs font-[var(--font-jetbrains-mono)] text-white/60 tracking-wider">
          TESTIMONIALS
        </label>
        
        <Reorder.Group axis="y" values={formData.items} onReorder={setItems} className="space-y-4">
          <AnimatePresence>
            {formData.items.map((item, index) => (
              <Reorder.Item
                key={item.id}
                value={item}
                className="bg-white/5 border border-white/10 rounded-sm p-4"
              >
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <GripVertical className="w-5 h-5 text-white/20 cursor-grab" />
                    <Quote className="w-4 h-4 text-[#ff006e]" />
                    <span className="text-xs font-[var(--font-jetbrains-mono)] text-white/40">
                      TESTIMONIAL {index + 1}
                    </span>
                    <button
                      onClick={() => removeTestimonial(index)}
                      className="ml-auto text-white/20 hover:text-[#ff006e] transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SHARED.Input
                      label="Name"
                      value={item.name}
                      onChange={(value) => updateTestimonial(index, 'name', value)}
                      placeholder="Client name"
                    />

                    <SHARED.Input
                      label="Company"
                      value={item.company}
                      onChange={(value) => updateTestimonial(index, 'company', value)}
                      placeholder="Company or organization"
                    />
                  </div>

                  <SHARED.TextArea
                    label="Quote"
                    value={item.quote}
                    onChange={(value) => updateTestimonial(index, 'quote', value)}
                    placeholder="Client testimonial quote..."
                    rows={3}
                  />

                  <div className="space-y-2">
                    <label className="block text-xs font-[var(--font-jetbrains-mono)] text-white/60 tracking-wider">
                      Tier
                    </label>
                    <select
                      value={item.tier || 'BRONZE'}
                      onChange={(e) => updateTestimonial(index, 'tier', e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-sm
                               text-white font-[var(--font-space-grotesk)] text-sm
                               focus:border-[#ff006e] focus:outline-none transition-colors"
                    >
                      <option value="GOLD">GOLD</option>
                      <option value="SILVER">SILVER</option>
                      <option value="BRONZE">BRONZE</option>
                    </select>
                  </div>
                </motion.div>
              </Reorder.Item>
            ))}
          </AnimatePresence>
        </Reorder.Group>

        <button
          onClick={addTestimonial}
          className="w-full py-4 border border-dashed border-white/20 rounded-sm
                   text-white/40 hover:text-white hover:border-white/40 transition-colors
                   font-[var(--font-jetbrains-mono)] text-xs tracking-widest"
        >
          <Plus className="w-4 h-4 inline-block mr-2" />
          ADD TESTIMONIAL
        </button>
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

export default TestimonialsEditor;
