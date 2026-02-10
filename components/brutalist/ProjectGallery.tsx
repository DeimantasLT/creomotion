"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface Project {
  id: number;
  title: string;
  category: string;
  image: string;
}

const projects: Project[] = [
  {
    id: 1,
    title: "NEON DYNAMICS",
    category: "BRAND IDENTITY",
    image: "/projects/project-1.jpg",
  },
  {
    id: 2,
    title: "VOID SYSTEMS",
    category: "WEB DESIGN",
    image: "/projects/project-2.jpg",
  },
  {
    id: 3,
    title: "RAW MATTER",
    category: "MOTION",
    image: "/projects/project-3.jpg",
  },
  {
    id: 4,
    title: "HARD EDGE",
    category: "DEVELOPMENT",
    image: "/projects/project-4.jpg",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

export default function ProjectGallery() {
  return (
    <section className="w-full bg-[#F5F5F0] py-24 px-6 md:px-12">
      {/* Section Header */}
      <div className="max-w-7xl mx-auto mb-16">
        <div className="flex items-end justify-between border-b-2 border-black pb-6">
          <div>
            <p
              className="text-xs tracking-[0.3em] mb-2"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              [SELECTED WORK]
            </p>
            <h2
              className="text-5xl md:text-7xl font-bold tracking-tighter uppercase"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              PROJECTS
            </h2>
          </div>
          <p
            className="text-sm hidden md:block"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            04 / PROJECTS
          </p>
        </div>
      </div>

      {/* Asymmetrical Grid - 60/40 Layout */}
      <motion.div
        className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-6"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        {/* Left Column - 60% */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {/* Large Project */}
          <motion.article
            variants={itemVariants}
            className="group relative border-2 border-black bg-black shadow-[8px_8px_0_#000]"
            style={{ boxShadow: "8px 8px 0 0 #000" }}
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image
                src={projects[0].image}
                alt={projects[0].title}
                fill
                className="object-cover grayscale transition-all duration-300 group-hover:grayscale-0"
              />
              <motion.div
                className="absolute inset-0 bg-[#FF2E63]/0 transition-colors duration-300"
                whileHover={{ backgroundColor: "rgba(255, 46, 99, 0.2)" }}
              />
            </div>
            <div className="border-t-2 border-black bg-[#F5F5F0] p-6">
              <p
                className="text-xs tracking-[0.2em] text-[#FF2E63] mb-1"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {projects[0].category}
              </p>
              <h3
                className="text-2xl font-bold uppercase"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {projects[0].title}
              </h3>
            </div>
          </motion.article>

          {/* Medium Project */}
          <motion.article
            variants={itemVariants}
            className="group relative border-2 border-black bg-black shadow-[8px_8px_0_#000]"
            style={{ boxShadow: "8px 8px 0 0 #000" }}
          >
            <div className="relative aspect-[16/9] overflow-hidden">
              <Image
                src={projects[2].image}
                alt={projects[2].title}
                fill
                className="object-cover grayscale transition-all duration-300 group-hover:grayscale-0"
              />
              <motion.div
                className="absolute inset-0 bg-[#FF2E63]/0 transition-colors duration-300"
                whileHover={{ backgroundColor: "rgba(255, 46, 99, 0.2)" }}
              />
            </div>
            <div className="border-t-2 border-black bg-[#F5F5F0] p-6">
              <p
                className="text-xs tracking-[0.2em] text-[#FF2E63] mb-1"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {projects[2].category}
              </p>
              <h3
                className="text-2xl font-bold uppercase"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {projects[2].title}
              </h3>
            </div>
          </motion.article>
        </div>

        {/* Right Column - 40% */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Tall Project */}
          <motion.article
            variants={itemVariants}
            className="group relative border-2 border-black bg-black shadow-[8px_8px_0_#000] flex-1"
            style={{ boxShadow: "8px 8px 0 0 #000" }}
          >
            <div className="relative aspect-[3/4] lg:aspect-auto lg:h-full overflow-hidden">
              <Image
                src={projects[1].image}
                alt={projects[1].title}
                fill
                className="object-cover grayscale transition-all duration-300 group-hover:grayscale-0"
              />
              <motion.div
                className="absolute inset-0 bg-[#FF2E63]/0 transition-colors duration-300"
                whileHover={{ backgroundColor: "rgba(255, 46, 99, 0.2)" }}
              />
            </div>
            <div className="absolute bottom-0 left-0 right-0 border-t-2 border-black bg-[#F5F5F0] p-6">
              <p
                className="text-xs tracking-[0.2em] text-[#FF2E63] mb-1"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {projects[1].category}
              </p>
              <h3
                className="text-xl font-bold uppercase"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {projects[1].title}
              </h3>
            </div>
          </motion.article>

          {/* Small Project */}
          <motion.article
            variants={itemVariants}
            className="group relative border-2 border-black bg-black shadow-[8px_8px_0_#000]"
            style={{ boxShadow: "8px 8px 0 0 #000" }}
          >
            <div className="relative aspect-square overflow-hidden">
              <Image
                src={projects[3].image}
                alt={projects[3].title}
                fill
                className="object-cover grayscale transition-all duration-300 group-hover:grayscale-0"
              />
              <motion.div
                className="absolute inset-0 bg-[#FF2E63]/0 transition-colors duration-300"
                whileHover={{ backgroundColor: "rgba(255, 46, 99, 0.2)" }}
              />
            </div>
            <div className="border-t-2 border-black bg-[#F5F5F0] p-4">
              <p
                className="text-xs tracking-[0.2em] text-[#FF2E63] mb-1"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {projects[3].category}
              </p>
              <h3
                className="text-lg font-bold uppercase"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {projects[3].title}
              </h3>
            </div>
          </motion.article>
        </div>
      </motion.div>

      {/* View All CTA */}
      <motion.div
        className="max-w-7xl mx-auto mt-16 flex justify-end"
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <motion.button
          className="group relative border-2 border-black bg-[#F5F5F0] px-8 py-4 font-bold uppercase tracking-wider"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            boxShadow: "8px 8px 0 0 #000",
          }}
          whileHover={{
            x: 4,
            y: 4,
            boxShadow: "4px 4px 0 0 #000",
          }}
          transition={{ duration: 0.2 }}
        >
          <span className="flex items-center gap-3">
            VIEW ALL PROJECTS
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="transition-transform duration-200 group-hover:translate-x-1"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </span>
        </motion.button>
      </motion.div>
    </section>
  );
}

