'use client';

import { useEffect } from 'react';
import { useProductivityStore } from '@/lib/store';

export function useInitializeStore() {
  const initialize = useProductivityStore(s => s.initialize);
  const initialized = useProductivityStore(s => s.initialized);

  useEffect(() => {
    if (!initialized) {
      initialize();
    }
  }, [initialize, initialized]);

  return initialized;
}

export function useTheme() {
  const theme = useProductivityStore(s => s.theme);
  const toggleTheme = useProductivityStore(s => s.toggleTheme);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return { theme, toggleTheme };
}
