import { useState, useEffect } from 'react';
import { PaletteMode } from '@mui/material';

interface UseThemeReturn {
  mode: PaletteMode;
  toggleTheme: () => void;
}

/**
 * Custom hook for managing theme mode with localStorage persistence
 */
export const useTheme = (): UseThemeReturn => {
  const [mode, setMode] = useState<PaletteMode>(() => {
    // Check localStorage first
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'light' || storedTheme === 'dark') {
      return storedTheme;
    }

    // Fallback to system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    return 'light';
  });

  useEffect(() => {
    // Update HTML attribute for CSS variables compatibility
    document.documentElement.setAttribute('data-theme', mode);

    // Save to localStorage
    localStorage.setItem('theme', mode);
  }, [mode]);

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  return { mode, toggleTheme };
};
