"use client";

import { motion } from "framer-motion";
import { useState } from "react";

export default function Contact() {
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    project: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormState((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log(formState);
  };

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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  return (
    <section className="w-full bg-[#F5F5F0] py-24 px-6 md:px-12" id="contact">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex items-end justify-between border-b-2 border-black pb-6 mb-16">
          <div>
            <p
              className="text-xs tracking-[0.3em] mb-2"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              [GET IN TOUCH]
            </p>
            <h2
              className="text-5xl md:text-7xl font-bold tracking-tighter uppercase"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              CONTACT
            </h2>
          </div>
          <p
            className="text-sm hidden md:block"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            05 / CONTACT
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.div variants={itemVariants} className="mb-12">
              <p
                className="text-xs tracking-[0.2em] text-[#FF2E63] mb-4"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                [EMAIL]
              </p>
              <a
                href="mailto:hello@creomotion.studio"
                className="text-2xl md:text-4xl font-bold uppercase hover:text-[#FF2E63] transition-colors duration-300"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                HELLO@CREOMOTION.STUDIO
              </a>
            </motion.div>

            <motion.div variants={itemVariants} className="mb-12">
              <p
                className="text-xs tracking-[0.2em] text-[#FF2E63] mb-4"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                [LOCATION]
              </p>
              <p
                className="text-xl md:text-2xl font-bold uppercase"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                VILNIUS, LITHUANIA
              </p>
              <p
                className="text-sm mt-2"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                WORKING WORLDWIDE
              </p>
            </motion.div>

            <motion.div variants={itemVariants}>
              <p
                className="text-xs tracking-[0.2em] text-[#FF2E63] mb-4"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                [SOCIAL]
              </p>
              <div className="flex flex-wrap gap-4">
                {["INSTAGRAM", "TWITTER", "LINKEDIN", "BEHANCE"].map((social) => (
                  <motion.a
                    key={social}
                    href="#"
                    className="border-2 border-black px-4 py-2 text-sm font-bold uppercase bg-[#F5F5F0]"
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      boxShadow: "4px 4px 0 0 #000",
                    }}
                    whileHover={{
                      x: 2,
                      y: 2,
                      boxShadow: "2px 2px 0 0 #000",
                      backgroundColor: "#000",
                      color: "#F5F5F0",
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    {social}
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Availability Badge */}
            <motion.div
              variants={itemVariants}
              className="mt-12 inline-flex items-center gap-3 border-2 border-black px-4 py-2"
              style={{ boxShadow: "4px 4px 0 0 #FF2E63" }}
            >
              <span className="w-3 h-3 bg-[#FF2E63] animate-pulse" />
              <span
                className="text-xs tracking-[0.2em] uppercase"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                ACCEPTING NEW PROJECTS
              </span>
            </motion.div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <form
              onSubmit={handleSubmit}
              className="border-2 border-black bg-[#F5F5F0] p-8"
              style={{ boxShadow: "8px 8px 0 0 #000" }}
            >
              <p
                className="text-xs tracking-[0.2em] text-[#FF2E63] mb-6"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                [PROJECT INQUIRY]
              </p>

              {/* Name Input */}
              <div className="mb-6">
                <label
                  htmlFor="name"
                  className="block text-xs tracking-[0.2em] mb-2 uppercase"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  NAME *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formState.name}
                  onChange={handleChange}
                  required
                  className="w-full border-2 border-black bg-[#F5F5F0] px-4 py-3 text-sm outline-none focus:bg-black focus:text-[#F5F5F0] transition-colors duration-200"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  placeholder="YOUR NAME"
                />
              </div>

              {/* Email Input */}
              <div className="mb-6">
                <label
                  htmlFor="email"
                  className="block text-xs tracking-[0.2em] mb-2 uppercase"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  EMAIL *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formState.email}
                  onChange={handleChange}
                  required
                  className="w-full border-2 border-black bg-[#F5F5F0] px-4 py-3 text-sm outline-none focus:bg-black focus:text-[#F5F5F0] transition-colors duration-200"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  placeholder="YOUR@EMAIL.COM"
                />
              </div>

              {/* Project Type Select */}
              <div className="mb-6">
                <label
                  htmlFor="project"
                  className="block text-xs tracking-[0.2em] mb-2 uppercase"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  PROJECT TYPE *
                </label>
                <select
                  id="project"
                  name="project"
                  value={formState.project}
                  onChange={handleChange}
                  required
                  className="w-full border-2 border-black bg-[#F5F5F0] px-4 py-3 text-sm outline-none focus:bg-black focus:text-[#F5F5F0] transition-colors duration-200 cursor-pointer"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  <option value="">SELECT PROJECT TYPE</option>
                  <option value="brand">BRAND IDENTITY</option>
                  <option value="web">WEB DEVELOPMENT</option>
                  <option value="motion">MOTION DESIGN</option>
                  <option value="creative">CREATIVE DIRECTION</option>
                  <option value="other">OTHER</option>
                </select>
              </div>

              {/* Message Textarea */}
              <div className="mb-8">
                <label
                  htmlFor="message"
                  className="block text-xs tracking-[0.2em] mb-2 uppercase"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  MESSAGE *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formState.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full border-2 border-black bg-[#F5F5F0] px-4 py-3 text-sm outline-none focus:bg-black focus:text-[#F5F5F0] transition-colors duration-200 resize-none"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  placeholder="TELL US ABOUT YOUR PROJECT..."
                />
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                className="w-full border-2 border-black bg-black text-[#F5F5F0] px-8 py-4 font-bold uppercase tracking-wider"
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  boxShadow: "4px 4px 0 0 #FF2E63",
                }}
                whileHover={{
                  x: -2,
                  y: -2,
                  boxShadow: "6px 6px 0 0 #FF2E63",
                  backgroundColor: "#FF2E63",
                  borderColor: "#FF2E63",
                }}
                transition={{ duration: 0.2 }}
              >
                SEND MESSAGE →
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

