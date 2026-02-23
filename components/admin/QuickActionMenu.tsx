'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, FileText, Users, FolderKanban, Clock } from 'lucide-react';

interface QuickActionMenuProps {
  onNewProject: () => void;
  onNewClient: () => void;
  onNewInvoice: () => void;
  onStartTimer: () => void;
}

const actions = [
  { id: 'project', label: 'New Project', icon: FolderKanban, color: '#ff006e' },
  { id: 'client', label: 'New Client', icon: Users, color: '#8338ec' },
  { id: 'invoice', label: 'New Invoice', icon: FileText, color: '#fb5607' },
  { id: 'timer', label: 'Start Timer', icon: Clock, color: '#ffbe0b' },
];

export default function QuickActionMenu(props: QuickActionMenuProps) {
  const { onNewProject, onNewClient, onNewInvoice, onStartTimer } = props;
  const [isOpen, setIsOpen] = useState(false);

  const handleAction = (id: string) => {
    setIsOpen(false);
    setTimeout(() => {
      switch (id) {
        case 'project': onNewProject(); break;
        case 'client': onNewClient(); break;
        case 'invoice': onNewInvoice(); break;
        case 'timer': onStartTimer(); break;
      }
    }, 200);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      <div className="fixed bottom-24 right-6 lg:bottom-8 lg:right-8 z-50 flex items-center gap-3">
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
            >
              {actions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <motion.button
                    key={action.id}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ delay: index * 0.03, duration: 0.15, ease: "easeOut" }}
                    onClick={() => handleAction(action.id)}
                    className="group relative flex items-center"
                  >
                    <span 
                      className="absolute -top-10 left-1/2 -translate-x-1/2 text-[10px] font-[var(--font-jetbrains-mono)] bg-[#141414] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                      style={{ color: action.color }}
                    >
                      {action.label}
                    </span>
                    
                    <motion.div
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-12 h-12 rounded-full flex items-center justify-center cursor-pointer"
                      style={{ backgroundColor: action.color }}
                    >
                      <Icon className="w-5 h-5 text-[#0a0a0a]" />
                    </motion.div>
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: isOpen ? 0.55 : 1.05 }}
          animate={{ 
            rotate: isOpen ? 45 : 0,
            scale: isOpen ? 0.5 : 1,
            backgroundColor: isOpen ? '#fff' : '#ff006e'
          }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="w-14 h-14 rounded-full flex items-center justify-center shadow-2xl cursor-pointer flex-shrink-0"
        >
          <Plus className="w-6 h-6 text-[#0a0a0a]" />
        </motion.button>
      </div>
    </>
  );
}
