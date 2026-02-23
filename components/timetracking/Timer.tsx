"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Square, RotateCcw, Check } from "lucide-react";

interface Project {
  id: string;
  name: string;
  client: string;
}

interface TimeEntry {
  id: string;
  projectId: string;
  projectName: string;
  clientName: string;
  description: string;
  duration: number;
  billable: boolean;
  startTime: Date;
  endTime?: Date;
}

interface TimerProps {
  projects: Project[];
  onEntryComplete: (entry: TimeEntry) => void;
}

type TimerState = "idle" | "running" | "paused";

const formatTime = (seconds: number): string => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

export default function Timer({ projects, onEntryComplete }: TimerProps) {
  const [timerState, setTimerState] = useState<TimerState>("idle");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [description, setDescription] = useState("");
  const [billable, setBillable] = useState(true);
  const [showProjectSelector, setShowProjectSelector] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerState === "running") {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerState]);

  const handleStart = () => {
    if (!selectedProject) {
      setShowProjectSelector(true);
      return;
    }
    setTimerState("running");
  };

  const handlePause = () => {
    setTimerState("paused");
  };

  const handleResume = () => {
    setTimerState("running");
  };

  const handleStop = useCallback(() => {
    if (!selectedProject) return;

    const entry: TimeEntry = {
      id: crypto.randomUUID(),
      projectId: selectedProject.id,
      projectName: selectedProject.name,
      clientName: selectedProject.client,
      description,
      duration: elapsedSeconds,
      billable,
      startTime: new Date(Date.now() - elapsedSeconds * 1000),
      endTime: new Date(),
    };

    onEntryComplete(entry);

    // Reset timer
    setTimerState("idle");
    setElapsedSeconds(0);
    setDescription("");
    setBillable(true);
  }, [selectedProject, description, elapsedSeconds, billable, onEntryComplete]);

  const handleReset = () => {
    setTimerState("idle");
    setElapsedSeconds(0);
    setDescription("");
  };

  const selectProject = (project: Project) => {
    setSelectedProject(project);
    setShowProjectSelector(false);
    if (timerState === "idle") {
      setTimerState("running");
    }
  };

  return (
    <div className="border-2 border-black bg-white" style={{ boxShadow: "8px 8px 0 0 #000" }}>
      {/* Header */}
      <div className="border-b-2 border-black bg-black text-white p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl font-bold tracking-tight">TIME TRACKER</h3>
          <span className="mono text-xs tracking-[0.2em] text-[#FF2E63]">[TRACKING]</span>
        </div>
      </div>

      <div className="p-6">
        {/* Project Selector */}
        <div className="mb-6">
          <label className="block text-xs tracking-[0.2em] mb-2 uppercase mono">
            PROJECT *
          </label>
          <button
            onClick={() => setShowProjectSelector(!showProjectSelector)}
            className="w-full border-2 border-black bg-[#F5F5F0] px-4 py-3 text-left flex items-center justify-between hover:bg-black hover:text-white transition-colors"
          >
            <span className={selectedProject ? "font-bold" : "text-gray-500"}>
              {selectedProject
                ? `${selectedProject.name} — ${selectedProject.client}`
                : "SELECT PROJECT"}
            </span>
            <motion.span
              animate={{ rotate: showProjectSelector ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              ▼
            </motion.span>
          </button>

          <AnimatePresence>
            {showProjectSelector && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="border-2 border-black border-t-0 bg-white overflow-hidden"
              >
                {projects.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 mono text-sm">
                    NO PROJECTS AVAILABLE
                  </div>
                ) : (
                  projects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => selectProject(project)}
                      className="w-full px-4 py-3 text-left border-b border-black last:border-b-0 hover:bg-[#FF2E63] hover:text-white transition-colors"
                    >
                      <div className="font-bold">{project.name}</div>
                      <div className="text-xs mono opacity-70">{project.client}</div>
                    </button>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Description Input */}
        <div className="mb-6">
          <label className="block text-xs tracking-[0.2em] mb-2 uppercase mono">
            DESCRIPTION
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="WHAT ARE YOU WORKING ON?"
            className="w-full border-2 border-black bg-[#F5F5F0] px-4 py-3 text-sm outline-none focus:bg-black focus:text-white transition-colors mono"
          />
        </div>

        {/* Timer Display */}
        <div className="mb-6">
          <div className="border-2 border-black bg-black p-8 text-center">
            <motion.div
              key={timerState}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="font-display text-6xl md:text-7xl font-bold text-white tracking-wider"
            >
              {formatTime(elapsedSeconds)}
            </motion.div>
            <div className="mt-2 mono text-xs tracking-[0.3em] text-[#FF2E63]">
              {timerState === "idle" && "READY"}
              {timerState === "running" && "TRACKING..."}
              {timerState === "paused" && "PAUSED"}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-3 mb-6">
          {timerState === "idle" && (
            <motion.button
              onClick={handleStart}
              className="flex-1 border-2 border-black bg-[#FF2E63] text-white px-6 py-4 font-bold uppercase tracking-wider flex items-center justify-center gap-3"
              style={{ boxShadow: "4px 4px 0 0 #000" }}
              whileHover={{ x: -2, y: -2, boxShadow: "6px 6px 0 0 #000" }}
              whileTap={{ x: 0, y: 0, boxShadow: "2px 2px 0 0 #000" }}
            >
              <Play className="w-5 h-5" fill="currentColor" />
              START
            </motion.button>
          )}

          {timerState === "running" && (
            <>
              <motion.button
                onClick={handlePause}
                className="flex-1 border-2 border-black bg-black text-white px-6 py-4 font-bold uppercase tracking-wider flex items-center justify-center gap-3"
                style={{ boxShadow: "4px 4px 0 0 #000" }}
                whileHover={{ x: -2, y: -2, boxShadow: "6px 6px 0 0 #000" }}
                whileTap={{ x: 0, y: 0, boxShadow: "2px 2px 0 0 #000" }}
              >
                <Pause className="w-5 h-5" fill="currentColor" />
                PAUSE
              </motion.button>
              <motion.button
                onClick={handleStop}
                className="flex-1 border-2 border-black bg-white text-black px-6 py-4 font-bold uppercase tracking-wider flex items-center justify-center gap-3"
                style={{ boxShadow: "4px 4px 0 0 #000" }}
                whileHover={{ x: -2, y: -2, boxShadow: "6px 6px 0 0 #000", backgroundColor: "#000", color: "#fff" }}
                whileTap={{ x: 0, y: 0, boxShadow: "2px 2px 0 0 #000" }}
              >
                <Square className="w-5 h-5" fill="currentColor" />
                STOP
              </motion.button>
            </>
          )}

          {timerState === "paused" && (
            <>
              <motion.button
                onClick={handleResume}
                className="flex-1 border-2 border-black bg-[#FF2E63] text-white px-6 py-4 font-bold uppercase tracking-wider flex items-center justify-center gap-3"
                style={{ boxShadow: "4px 4px 0 0 #000" }}
                whileHover={{ x: -2, y: -2, boxShadow: "6px 6px 0 0 #000" }}
                whileTap={{ x: 0, y: 0, boxShadow: "2px 2px 0 0 #000" }}
              >
                <Play className="w-5 h-5" fill="currentColor" />
                RESUME
              </motion.button>
              <motion.button
                onClick={handleStop}
                className="flex-1 border-2 border-black bg-white text-black px-6 py-4 font-bold uppercase tracking-wider flex items-center justify-center gap-3"
                style={{ boxShadow: "4px 4px 0 0 #000" }}
                whileHover={{ x: -2, y: -2, boxShadow: "6px 6px 0 0 #000", backgroundColor: "#000", color: "#fff" }}
                whileTap={{ x: 0, y: 0, boxShadow: "2px 2px 0 0 #000" }}
              >
                <Check className="w-5 h-5" />
                SAVE
              </motion.button>
              <motion.button
                onClick={handleReset}
                className="px-4 py-4 border-2 border-black bg-[#F5F5F0]"
                style={{ boxShadow: "4px 4px 0 0 #000" }}
                whileHover={{ x: -2, y: -2, boxShadow: "6px 6px 0 0 #000", backgroundColor: "#FF2E63", color: "#fff", borderColor: "#FF2E63" }}
                whileTap={{ x: 0, y: 0, boxShadow: "2px 2px 0 0 #000" }}
              >
                <RotateCcw className="w-5 h-5" />
              </motion.button>
            </>
          )}
        </div>

        {/* Billable Toggle */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => setBillable(!billable)}
              className={`w-12 h-6 border-2 border-black relative cursor-pointer transition-colors ${
                billable ? "bg-[#FF2E63]" : "bg-[#F5F5F0]"
              }`}
            >
              <motion.div
                className="absolute top-0.5 w-4 h-4 bg-black"
                animate={{ left: billable ? "calc(100% - 1.25rem)" : "0.25rem" }}
                transition={{ duration: 0.2 }}
              />
            </div>
            <span className="mono text-xs tracking-[0.2em] uppercase">
              {billable ? "BILLABLE" : "NON-BILLABLE"}
            </span>
          </label>

          {selectedProject && timerState !== "idle" && (
            <div className="mono text-xs">
              <span className="text-gray-500">PROJECT:</span>{" "}
              <span className="font-bold">{selectedProject.name}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

