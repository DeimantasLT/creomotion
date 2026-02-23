'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Film, Sparkles, Box, Palette } from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  film: Film,
  sparkles: Sparkles,
  box: Box,
  palette: Palette,
};

interface ServiceItem {
  title: string;
  description: string;
  icon: string;
}

interface ServicesContent {
  title: string;
  items: ServiceItem[];
}

export default function ServicesSection() {
  const [content, setContent] = useState<ServicesContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/content/public')
      .then(res => res.json())
      .then(data => {
        if (data.content?.services) {
          setContent(data.content.services.data as ServicesContent);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const services = content?.items || [
    { title: 'Motion Graphics', description: 'Dynamic animations for commercials, explainers, and branded content.', icon: 'film' },
    { title: 'AI Video Production', description: 'Cutting-edge AI tools to enhance and accelerate video creation.', icon: 'sparkles' },
    { title: '3D Animation', description: 'Cinema-quality 3D visuals and character animation.', icon: 'box' },
    { title: 'Post-Production', description: 'Color grading, sound design, and VFX compositing.', icon: 'palette' },
  ];

  if (loading) {
    return (
      <section className="py-24 bg-slate-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="h-8 w-64 bg-slate-800 rounded animate-pulse mb-16" />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-64 bg-slate-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-slate-900">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {content?.title || 'Our Services'}
          </h2>
          <p className="text-slate-400 text-lg">Creative solutions for every project</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => {
            const Icon = iconMap[service.icon] || Film;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group p-8 bg-slate-800/50 border border-slate-700 rounded-2xl hover:border-cyan-500/50 hover:bg-slate-800 transition-all"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Icon className="w-7 h-7 text-cyan-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{service.title}</h3>
                <p className="text-slate-400">{service.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
