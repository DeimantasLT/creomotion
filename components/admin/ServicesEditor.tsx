'use client';

import { useState, useEffect } from 'react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import { Save, RotateCcw, Plus, Trash2, GripVertical, Hash } from 'lucide-react';
import { useContentSection } from '@/hooks/useContentSection';
import { SHARED } from './shared';

const PALETTE = {
  pink: "#ff006e",
};

interface Service {
  num: string;
  title: string;
  shortDesc: string;
  fullDesc: string;
}

interface ServicesEditorProps {
  onSave: () => void;
}

const DEFAULT_SERVICES: Service[] = [
  {
    num: "01",
    title: "Motion Graphics",
    shortDesc: "Broadcast-ready animations",
    fullDesc: "From title sequences to full channel branding. We create motion that captures attention and tells your story.",
  },
  {
    num: "02",
    title: "AI Video",
    shortDesc: "Generative content creation",
    fullDesc: "Leveraging latest AI tools for face swap, voice synthesis, and generative content. Fast turnaround without compromising quality.",
  },
  {
    num: "03",
    title: "Post-Production",
    shortDesc: "Color & finishing",
    fullDesc: "Professional color grading, VFX integration, sound design, and final delivery in any broadcast format.",
  },
  {
    num: "04",
    title: "Brand Identity",
    shortDesc: "Visual systems",
    fullDesc: "Logo animations, complete visual identity systems, brand guidelines, and reusable motion templates.",
  },
];

export function ServicesEditor({ onSave }: ServicesEditorProps) {
  const { section, data, loading, update } = useContentSection('services');
  const [services, setServices] = useState<Service[]>(DEFAULT_SERVICES);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) {
      // Handle both array format and { items: [] } format
      const items = Array.isArray(data) ? data : data.items || DEFAULT_SERVICES;
      setServices(items.map((s: Service, i: number) => ({
        ...s,
        num: s.num || String(i + 1).padStart(2, '0'),
      })));
    }
  }, [data]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save as array of services for HeroFinal compatibility
      await update(services);
      onSave();
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (data) {
      const items = Array.isArray(data) ? data : data.items || DEFAULT_SERVICES;
      setServices(items.map((s: Service, i: number) => ({
        ...s,
        num: s.num || String(i + 1).padStart(2, '0'),
      })));
    } else {
      setServices(DEFAULT_SERVICES);
    }
  };

  const addService = () => {
    const newService: Service = {
      num: String(services.length + 1).padStart(2, '0'),
      title: 'New Service',
      shortDesc: 'Short description...',
      fullDesc: 'Full description of the service goes here.',
    };
    setServices([...services, newService]);
  };

  const updateService = (index: number, field: keyof Service, value: string) => {
    const updated = [...services];
    updated[index] = { ...updated[index], [field]: value };
    setServices(updated);
  };

  const removeService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const setServicesOrder = (newServices: Service[]) => {
    // Re-number services based on new order
    const renumbered = newServices.map((s, i) => ({
      ...s,
      num: String(i + 1).padStart(2, '0'),
    }));
    setServices(renumbered);
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
        <Reorder.Group axis="y" values={services} onReorder={setServicesOrder} className="space-y-4">
          <AnimatePresence>
            {services.map((service, index) => (
              <Reorder.Item
                key={`${service.num}-${index}`}
                value={service}
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
                    <span className="text-xs font-[var(--font-jetbrains-mono)] text-white/40">
                      SERVICE {service.num}
                    </span>
                    <button
                      onClick={() => removeService(index)}
                      className="ml-auto text-white/20 hover:text-[#ff006e] transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center gap-3">
                      <Hash className="w-4 h-4 text-[#ff006e] flex-shrink-0" />
                      <input
                        type="text"
                        value={service.num}
                        onChange={(e) => updateService(index, 'num', e.target.value)}
                        placeholder="Num (e.g., 01)"
                        className="w-20 px-3 py-2 bg-white/5 border border-white/10 rounded-sm
                                 text-white text-sm text-center placeholder:text-white/20
                                 focus:border-[#ff006e] focus:outline-none"
                      />
                    </div>

                    <SHARED.Input
                      label="Service Title"
                      value={service.title}
                      onChange={(value) => updateService(index, 'title', value)}
                      placeholder="e.g., Motion Graphics"
                    />

                    <SHARED.Input
                      label="Short Description (shown initially)"
                      value={service.shortDesc}
                      onChange={(value) => updateService(index, 'shortDesc', value)}
                      placeholder="e.g., Broadcast-ready animations"
                    />

                    <SHARED.TextArea
                      label="Full Description (shown on hover)"
                      value={service.fullDesc}
                      onChange={(value) => updateService(index, 'fullDesc', value)}
                      placeholder="Detailed description shown when hovering..."
                      rows={3}
                    />
                  </div>
                </motion.div>
              </Reorder.Item>
            ))}
          </AnimatePresence>
        </Reorder.Group>

        <button
          onClick={addService}
          className="w-full py-4 border border-dashed border-white/20 rounded-sm
                   text-white/40 hover:text-white hover:border-white/40 transition-colors
                   font-[var(--font-jetbrains-mono)] text-xs tracking-widest"
        >
          <Plus className="w-4 h-4 inline-block mr-2" />
          ADD SERVICE
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

export default ServicesEditor;
