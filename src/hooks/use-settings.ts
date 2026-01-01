'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface SettingsState {
  iconSize: number;
  setIconSize: (size: number) => void;
}

const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      iconSize: 64, // Default icon size
      setIconSize: (size) => set({ iconSize: size }),
    }),
    {
      name: 'viltrum-wallet-settings', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    }
  )
);

// Custom hook to handle hydration issues with Zustand and Next.js
// See: https://docs.pmnd.rs/zustand/integrations/nextjs
import { useState, useEffect } from 'react';

export const useSettings = () => {
  const storedSettings = useSettingsStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  // Return default values until the store is hydrated
  return hydrated
    ? storedSettings
    : {
        iconSize: 64, // Return default value
        setIconSize: () => {}, // No-op function
      };
};
