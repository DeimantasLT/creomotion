'use client';

import { useState, useCallback } from 'react';

interface UseClipboardReturn {
  copy: (text: string) => Promise<boolean>;
  copied: boolean;
  error: string | null;
  isSupported: boolean;
}

export function useClipboard(): UseClipboardReturn {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Check if clipboard is supported (only on client)
  const isSupported = typeof window !== 'undefined' && 
    typeof navigator !== 'undefined' && 
    !!navigator.clipboard;

  const copy = useCallback(async (text: string): Promise<boolean> => {
    if (!isSupported) {
      setError('Clipboard API not supported');
      return false;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setError(null);
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
      return true;
    } catch (err) {
      setError('Failed to copy to clipboard');
      setCopied(false);
      return false;
    }
  }, [isSupported]);

  return { copy, copied, error, isSupported };
}
