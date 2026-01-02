'use client';

import { create } from 'zustand';
import type { Transaction } from '@/lib/types';
import { useEffect, useCallback } from 'react';
import { useAuth } from './use-auth';

interface WalletState {
  balance: number;
  transactions: Transaction[];
  circulatingSupply: number;
  exchangeRate: number;
  loading: boolean;
  actions: {
    fetchWalletData: (userId: string | undefined) => Promise<void>;
  };
}

const useWalletStore = create<WalletState>()((set, get) => ({
  balance: 0,
  transactions: [],
  circulatingSupply: 0,
  exchangeRate: 36.5, // Default/initial value
  loading: true,
  actions: {
    fetchWalletData: async (userId) => {
        set({ loading: true });
        try {
          const fetchPromises = [];

          // Fetch user-specific data only if userId is available
          if (userId) {
            fetchPromises.push(
              fetch(`/api/wallet/balance?userId=${userId}`).then(res => res.json())
            );
          } else {
            // Push a placeholder promise that resolves to null
             fetchPromises.push(Promise.resolve(null));
          }
          
          // Fetch global data
          fetchPromises.push(fetch('/api/settings').then(res => res.json()));
          fetchPromises.push(fetch('/api/wallet/supply').then(res => res.json()));
          
          const [walletData, settingsData, supplyData] = await Promise.all(fetchPromises);

          const newState: Partial<WalletState> = {};

          if (walletData) {
            newState.balance = walletData.balance;
            newState.transactions = walletData.transactions;
          } else {
            // If no user, reset user-specific state
            newState.balance = 0;
            newState.transactions = [];
          }

          if (settingsData) {
            const rateSetting = settingsData.find((s: any) => s.setting_key === 'exchange_rate');
            if (rateSetting) {
              newState.exchangeRate = parseFloat(rateSetting.setting_value);
            }
          }

          if (supplyData) {
            newState.circulatingSupply = supplyData.circulatingSupply;
          }

          set(newState);

        } catch (error) {
            console.error("Failed to fetch wallet data:", error);
        } finally {
            set({ loading: false });
        }
    }
  }
}));

// Custom hook to connect the store to React's lifecycle
export const useWallet = () => {
  const { user } = useAuth();
  const state = useWalletStore();
  const { fetchWalletData } = useWalletStore((s) => s.actions);

  useEffect(() => {
    // Fetch data when the component mounts and when the user's ID changes.
    // The fetch action itself is defined in the store.
    fetchWalletData(user?.uid);
  }, [user?.uid, fetchWalletData]);

  // A manual refresh function that can be called from components
  const refreshWallet = useCallback(() => {
    fetchWalletData(user?.uid);
  }, [user?.uid, fetchWalletData]);

  return { ...state, refreshWallet };
};
