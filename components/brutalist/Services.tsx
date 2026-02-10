"use client";

import { motion } from "framer-motion";

interface Service {
  id: number;
  number: string;
  title: string;
  description: string;
  deliverables: string[];
}

const services: Service[] = [
  {
    id: 1,
    number: "01",
    title: "BRAND IDENTITY",
    description: "Raw, unfiltered brand systems that cut through the noise.",
    deliverables: ["LOGO DESIGN", "TYPOGRAPHY", "COLOR SYSTEM", "BRAND GUIDELINES"],
  },
  {
    id: 2,
    number: "02",
    title: "WEB DEVELOPMENT",
    description: "Performance-first code with brutalist aesthetics.",
    deliverables: ["FRONTEND", "BACKEND", "CMS", "E-COMMERCE"],
  },
  {
    id: 3,
    number: "03",
    title: "MOTION DESIGN",
    description: "Sharp transitions that respect the user's attention.",
    deliverables: ["UI ANIMATION", "MICRO-INTERACTIONS", "PAGE TRANSITIONS", "LOADING STATES"],
  },
  {
    id: 4,
    number: "04",
    title: "CREATIVE DIRECTION",
    description: "Strategic vision with uncompromising execution.",
    deliverables: ["ART DIRECTION", "CAMPAIGN CONCEPT", "PHOTO SHOOTS", "CONTENT STRATEGY"],
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
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

export default function Services() {
  return (
    <section className="w-full bg-[#F5F5F0] py-24 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex items-end justify-between border-b-2 border-black pb-6 mb-16">
          <div>
            <p
              className="text-xs tracking-[0.3em] mb-2"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              [WHAT WE DO]
            </p>
            <h2
              className="text-5xl md:text-7xl font-bold tracking-tighter uppercase"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              SERVICES
            </h2>
          </div>
          <p
            className="text-sm hidden md:block"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            04 / SERVICES
          </p>
        </div>

        {/* Services Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {services.map((service) => (
            <motion.article
              key={service.id}
              variants={itemVariants}
              className="group relative border-2 border-black bg-[#F5F5F0] p-8"
              style={{ boxShadow: "8px 8px 0 0 #000" }}
              whileHover={{
                x: 4,
                y: 4,
                boxShadow: "4px 4px 0 0 #000",
              }}
              transition={{ duration: 0.2 }}
            >
              {/* Service Number */}
              <div className="flex items-start justify-between mb-8">
                <span
                  className="text-6xl font-bold text-black/10 group-hover:text-[#FF2E63]/20 transition-colors duration-300"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {service.number}
                </span>
                <motion.div
                  className="w-12 h-12 border-2 border-black flex items-center justify-center bg-[#F5F5F0] group-hover:bg-black transition-colors duration-300"
                  whileHover={{ rotate: 45 }}
                  transition={{ duration: 0.2 }}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-black group-hover:text-[#F5F5F0] transition-colors duration-300"
                  >
                    <path d="M7 17L17 7M17 7H7M17 7V17" />
                  </svg>
                </motion.div>
              </div>

              {/* Service Title */}
              <h3
                className="text-2xl font-bold uppercase mb-4 tracking-tight"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {service.title}
              </h3>

              {/* Service Description */}
              <p
                className="text-sm mb-6 leading-relaxed"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {service.description}
              </p>

              {/* Deliverables List */}
              <div className="border-t-2 border-black pt-6">
                <p
                  className="text-xs tracking-[0.2em] text-[#FF2E63] mb-3"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  [DELIVERABLES]
                </p>
                <ul className="flex flex-wrap gap-2">
                  {service.deliverables.map((item, index) => (
                    <li
                      key={index}
                      className="text-xs border-2 border-black px-3 py-1 bg-[#F5F5F0] group-hover:bg-black group-hover:text-[#F5F5F0] transition-colors duration-300"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.article>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          className="mt-16 border-2 border-black p-8 bg-black text-[#F5F5F0]"
          style={{ boxShadow: "8px 8px 0 0 #FF2E63" }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <p
                className="text-xs tracking-[0.2em] text-[#FF2E63] mb-2"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                [CUSTOM PROJECT?]
              </p>
              <h3
                className="text-2xl md:text-3xl font-bold uppercase"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                NEED SOMETHING ELSE?
              </h3>
            </div>
            <motion.button
              className="border-2 border-[#F5F5F0] bg-[#F5F5F0] text-black px-8 py-4 font-bold uppercase tracking-wider"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                boxShadow: "4px 4px 0 0 #FF2E63",
              }}
              whileHover={{
                x: -2,
                y: -2,
                boxShadow: "6px 6px 0 0 #FF2E63",
              }}
              transition={{ duration: 0.2 }}
            >
              LET&apos;S TALK
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

