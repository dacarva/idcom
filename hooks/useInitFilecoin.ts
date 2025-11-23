'use client';

import { useEffect, useRef } from 'react';
import { useFilecoinStore } from '@/stores/filecoin-store';

/**
 * Hook that initializes Filecoin payment service globally (one-time only)
 * Uses Zustand store to prevent multiple initializations
 */
export function useInitFilecoin() {
  const initialize = useFilecoinStore((state) => state.initialize);
  const initialized = useFilecoinStore((state) => state.initialized);
  const initRef = useRef(false);

  useEffect(() => {
    // Only initialize once globally (first component that uses this hook)
    if (!initialized && !initRef.current) {
      initRef.current = true;
      initialize();
    }
  }, [initialized, initialize]);
}
