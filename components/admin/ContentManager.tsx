'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutTemplate, 
  Type, 
  Image as ImageIcon, 
  Video, 
  List,
  ChevronRight,
  Globe,
  Sparkles,
  Users,
  Phone,
  Info,
  Briefcase
} from 'lucide-react';

// Sub-components
import { HeroEditor } from './HeroEditor';
import { ServicesEditor } from './ServicesEditor';
import { TestimonialsEditor } from './TestimonialsEditor';
import { AboutEditor } from './AboutEditor';
import { ContactEditor } from './ContactEditor';
import { SEOEditor } from './SEOEditor';
import { ProjectsEditor } from './ProjectsEditor';

const PALETTE = {
  pink: "#ff006e",
  purple: "#8338ec",
  blue: "#3a86ff",
};

interface ContentItem {
  key: string;
  label: string;
  icon: React.ElementType;
  description: string;
  component: React.ComponentType<{ onSave: () => void }>;
}

const CONTENT_ITEMS: ContentItem[] = [
  {
    key: 'hero',
    label: 'Hero Section',
    icon: Sparkles,
    description: 'Main landing area with title, subtitle, and CTA',
    component: HeroEditor,
  },
  {
    key: 'services',
    label: 'Services',
    icon: List,
    description: 'Service cards with icons and descriptions',
    component: ServicesEditor,
  },
  {
    key: 'testimonials',
    label: 'Testimonials',
    icon: Users,
    description: 'Client quotes and reviews',
    component: TestimonialsEditor,
  },
  {
    key: 'about',
    label: 'About Section',
    icon: Info,
    description: 'Company story and timeline',
    component: AboutEditor,
  },
  {
    key: 'projects',
    label: 'Projects',
    icon: Briefcase,
    description: 'Recent projects showcase',
    component: ProjectsEditor,
  },
  {
    key: 'contact',
    label: 'Contact',
    icon: Phone,
    description: 'Contact section with CTA',
    component: ContactEditor,
  },
  {
    key: 'seo',
    label: 'SEO Settings',
    icon: Globe,
    description: 'Site metadata and social sharing',
    component: SEOEditor,
  },
];

export function ContentManager() {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const selectedItem = CONTENT_ITEMS.find((item) => item.key === selectedKey);
  const SelectedComponent = selectedItem?.component;

  const handleSave = () => {
    // Could show a toast or notification here
    console.log('Content saved');
  };

  return (
    <div className="space-y-6">
      {!selectedKey ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold font-[var(--font-space-grotesk)] tracking-widest mb-1">
                CONTENT SECTIONS
              </h2>
              <p className="text-sm text-white/40 font-[var(--font-jetbrains-mono)]">
                Manage website content sections
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CONTENT_ITEMS.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedKey(item.key)}
                  className="group flex items-center gap-4 p-5 bg-white/5 border border-white/10 
                           rounded-sm hover:bg-white/10 hover:border-white/20 transition-all
                           text-left"
                >
                  <div 
                    className="w-12 h-12 rounded-sm flex items-center justify-center transition-colors"
                    style={{ backgroundColor: `${PALETTE.pink}20` }}
                  >
                    <Icon 
                      className="w-6 h-6 transition-colors" 
                      style={{ color: PALETTE.pink }}
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-[var(--font-space-grotesk)] font-bold text-white mb-1 truncate">
                      {item.label}
                    </h3>
                    <p className="text-xs text-white/40 font-[var(--font-jetbrains-mono)] truncate">
                      {item.description}
                    </p>
                  </div>

                  <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-white/60 transition-colors" />
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedKey}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => setSelectedKey(null)}
                className="flex items-center gap-2 text-white/40 hover:text-white transition-colors
                         font-[var(--font-jetbrains-mono)] text-xs tracking-widest"
              >
                ← BACK
              </button>
            </div>

            <div className="border border-white/10 bg-white/5 rounded-sm p-6">
              <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                {selectedItem && (
                  <>
                    <selectedItem.icon 
                      className="w-6 h-6" 
                      style={{ color: PALETTE.pink }}
                    />
                    <h2 className="text-xl font-bold font-[var(--font-space-grotesk)]">
                      {selectedItem.label}
                    </h2>
                  </>
                )}
              </div>

              {SelectedComponent && <SelectedComponent onSave={handleSave} />}
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

export default ContentManager;
