'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface SettingsState {
  iconSize: number;
  setIconSize: (size: number) => void;
  titleSize: number;
  setTitleSize: (size: number) => void;
  balanceSize: number;
  setBalanceSize: (size: number) => void;
}

const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      iconSize: 64, // Default icon size
      setIconSize: (size) => set({ iconSize: size }),
      titleSize: 36, // Default page title size
      setTitleSize: (size) => set({ titleSize: size }),
      balanceSize: 48, // Default balance text size
      setBalanceSize: (size) => set({ balanceSize: size }),
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

const defaultSettings = {
    iconSize: 64,
    titleSize: 36,
    balanceSize: 48,
};

export const useSettings = () => {
  const storedSettings = useSettingsStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return hydrated
    ? storedSettings
    : {
        ...defaultSettings,
        setIconSize: () => {},
        setTitleSize: () => {},
        setBalanceSize: () => {},
      };
};
