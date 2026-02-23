'use client';

import { useState, useEffect } from 'react';

interface UseReducedMotionReturn {
  reducedMotion: boolean;
  isMobile: boolean;
  isTouch: boolean;
}

export function useReducedMotion(): UseReducedMotionReturn {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    // Detect mobile by screen size and touch
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      const touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsMobile(mobile);
      setIsTouch(touch);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  return { reducedMotion, isMobile, isTouch };
}
