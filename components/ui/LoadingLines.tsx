'use client';

import { motion } from 'framer-motion';

interface LoadingLinesProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

const sizeConfig = {
  sm: { lineHeight: 'h-2', lineWidth: 'w-4', gap: 'gap-1' },
  md: { lineHeight: 'h-3', lineWidth: 'w-6', gap: 'gap-1.5' },
  lg: { lineHeight: 'h-4', lineWidth: 'w-8', gap: 'gap-2' },
};

export default function LoadingLines({
  size = 'md',
  color = '#ff006e',
  className = '',
}: LoadingLinesProps) {
  const config = sizeConfig[size];

  return (
    <div className={`flex items-center justify-center ${config.gap} ${className}`}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={`${config.lineWidth} ${config.lineHeight} rounded-sm`}
          style={{ backgroundColor: color }}
          animate={{
            scaleY: [1, 1.5, 1],
            opacity: [0.4, 1, 0.4],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: i * 0.15,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

// Full page loading with wave lines aesthetic
export function LoadingWave({ text = 'LOADING' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative">
        {/* Animated wave lines */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{
              width: 100 + i * 20,
              height: 2,
            }}
          >
            <motion.div
              className="w-full h-full rounded-full"
              style={{
                background: `linear-gradient(90deg, transparent, ${['#ff006e', '#8338ec', '#3a86ff'][i]}, transparent)`,
              }}
              animate={{
                scaleX: [0.5, 1, 0.5],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3,
                ease: 'easeInOut',
              }}
            />
          </motion.div>
        ))}
        {/* Center dot */}
        <motion.div
          className="w-3 h-3 rounded-full bg-[#ff006e]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>
      <span className="font-[var(--font-jetbrains-mono)] text-xs text-white/60 tracking-[0.3em] uppercase">
        [{text}]
      </span>
    </div>
  );
}

// Skeleton loader with lines
export function SkeletonLines({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          className="h-4 bg-white/5 rounded"
          initial={{ opacity: 0.3 }}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.1,
            ease: 'easeInOut',
          }}
          style={{
            width: `${Math.random() * 30 + 60}%`,
          }}
        />
      ))}
    </div>
  );
}
