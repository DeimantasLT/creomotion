'use client';

import { motion } from 'framer-motion';
import { Play, ExternalLink } from 'lucide-react';
import { FadeIn } from '@/components/shared/FadeIn';

// Real projects from Creomotion portfolio
const projects = [
  {
    id: '1',
    title: 'Documentary "Driver Wanted"',
    category: 'Motion Graphics',
    year: '2023',
    description: 'Full motion graphics package for feature documentary',
    thumbnail: '/images/project-driver-wanted.jpg',
  },
  {
    id: '2',
    title: '"PC Lietuva" Movie',
    category: 'Graphic Design',
    year: '2023',
    description: 'Movie graphic design and visual effects',
    thumbnail: '/images/project-pc-lietuva.jpg',
  },
  {
    id: '3',
    title: '"LRT Ieško sprendimų" Opener',
    category: 'Broadcast Design',
    year: '2022',
    description: 'TV show opening sequence for LRT',
    thumbnail: '/images/project-lrt-iesko.jpg',
  },
  {
    id: '4',
    title: 'LRT 65 Year Anniversary',
    category: 'Broadcast Design',
    year: '2022',
    description: 'Special anniversary broadcast opener',
    thumbnail: '/images/project-lrt-65.jpg',
  },
  {
    id: '5',
    title: '"War in Ukraine" Opener',
    category: 'Broadcast Design',
    year: '2022',
    description: 'News broadcast opening graphics',
    thumbnail: '/images/project-ukraine.jpg',
  },
  {
    id: '6',
    title: '"US President Inauguration" Opener',
    category: 'Broadcast Design',
    year: '2022',
    description: 'Special news coverage graphics',
    thumbnail: '/images/project-us-inauguration.jpg',
  },
  {
    id: '7',
    title: '"LRT Girdi" Opener',
    category: 'Broadcast Design',
    year: '2022',
    description: 'Radio show visual branding',
    thumbnail: '/images/project-lrt-girdi.jpg',
  },
];

export function ProjectGallery() {
  return (
    <section className="py-24 md:py-32 bg-[#F5F5F0]" id="projects">
      <div className="container mx-auto px-6 md:px-12">
        {/* Section Header */}
        <FadeIn className="mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            Selected <span className="text-gradient">Works</span>
          </h2>
          <p className="text-gray-600 max-w-xl">
            A curated selection of broadcast design and motion graphics projects
            for television, film, and digital media.
          </p>
        </FadeIn>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>

        {/* View All CTA */}
        <FadeIn className="mt-16 text-center" delay={0.4}>
          <motion.a
            href="#contact"
            className="inline-flex items-center gap-2 text-creo-coral hover:text-hover:bg-[#E61E51] font-semibold transition-colors"
            whileHover={{ x: 4 }}
          >
            Start Your Project
            <ExternalLink className="w-4 h-4" />
          </motion.a>
        </FadeIn>
      </div>
    </section>
  );
}

function ProjectCard({ project, index }: { project: typeof projects[0]; index: number }) {
  return (
    <FadeIn delay={index * 0.1}>
      <motion.article
        className="group relative aspect-[4/3] rounded-xl overflow-hidden cursor-pointer bg-white"
        whileHover={{ y: -8 }}
        transition={{ duration: 0.3 }}
      >
        {/* Placeholder thumbnail with gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-creo-surface via-creo-elevated to-creo-surface">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-creo-coral/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-creo-coral/20 transition-colors">
                <Play className="w-6 h-6 text-creo-coral ml-1" />
              </div>
              <span className="text-gray-500 text-sm">{project.title}</span>
            </div>
          </div>
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-creo-bg via-creo-bg/40 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

        {/* Info */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-creo-coral font-medium">{project.category}</span>
            <span className="text-xs text-gray-500">• {project.year}</span>
          </div>
          <h3 className="font-display text-xl font-bold text-white group-hover:text-creo-coral transition-colors">
            {project.title}
          </h3>
          <p className="text-sm text-gray-500 mt-2 line-clamp-2">
            {project.description}
          </p>
        </div>

        {/* Glow border on hover */}
        <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-creo-coral/30" />
      </motion.article>
    </FadeIn>
  );
}

