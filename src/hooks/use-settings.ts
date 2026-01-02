'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface SettingsState {
  exchangeRate: number;
  setExchangeRate: (rate: number) => void;
}

const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      exchangeRate: 36.5, // Default exchange rate
      setExchangeRate: (rate) => set({ exchangeRate: rate }),
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
    exchangeRate: 36.5,
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
        setExchangeRate: () => {},
      };
};
