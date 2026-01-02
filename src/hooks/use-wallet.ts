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
  fetchWalletData: (userId: string) => Promise<void>;
  reset: () => void;
}

const useWalletStore = create<WalletState>((set) => ({
  balance: 0,
  transactions: [],
  circulatingSupply: 0,
  exchangeRate: 36.5, // Default/initial value
  loading: true,
  fetchWalletData: async (userId: string) => {
    set({ loading: true });
    try {
      if (!userId) {
        // If no user, reset user-specific state and stop loading
        set({ balance: 0, transactions: [], loading: false });
        return;
      }
      
      const [walletRes, settingsRes, supplyRes] = await Promise.all([
        fetch(`/api/wallet/balance?userId=${userId}`),
        fetch('/api/settings'),
        fetch('/api/wallet/supply')
      ]);

      const walletData = await walletRes.json();
      const settingsData = await settingsRes.json();
      const supplyData = await supplyRes.json();
      
      const newState: Partial<WalletState> = {};

      if (walletRes.ok) {
        newState.balance = walletData.balance;
        newState.transactions = walletData.transactions;
      } else {
        // Reset user-specific state on error
        newState.balance = 0;
        newState.transactions = [];
      }

      if (settingsRes.ok) {
        const rateSetting = settingsData.find((s: any) => s.setting_key === 'exchange_rate');
        if (rateSetting) {
          newState.exchangeRate = parseFloat(rateSetting.setting_value);
        }
      }

      if (supplyRes.ok) {
        newState.circulatingSupply = supplyData.circulatingSupply;
      }

      set(newState);

    } catch (error) {
      console.error("Failed to fetch wallet data:", error);
      set({ balance: 0, transactions: [] }); // Reset on error
    } finally {
      set({ loading: false });
    }
  },
  reset: () => set({ balance: 0, transactions: [], loading: true }),
}));

// Custom hook to connect the store to React's lifecycle
export const useWallet = () => {
  const { user, loading: authLoading } = useAuth();
  const {
    balance,
    transactions,
    circulatingSupply,
    exchangeRate,
    loading: walletLoading,
    fetchWalletData,
    reset,
  } = useWalletStore();

  useEffect(() => {
    // If auth is done loading...
    if (!authLoading) {
      // And we have a user...
      if (user?.uid) {
        // ...fetch their data.
        fetchWalletData(user.uid);
      } else {
        // Otherwise, if there is no user, reset the wallet state.
        reset();
      }
    }
  }, [user?.uid, authLoading, fetchWalletData, reset]);

  // The refresh function can be called manually from components
  const refreshWallet = useCallback(() => {
    if (user?.uid) {
      fetchWalletData(user.uid);
    }
  }, [user?.uid, fetchWalletData]);

  // Consolidate loading state. The wallet is loading if auth is loading OR the wallet itself is loading.
  const loading = authLoading || walletLoading;

  return { balance, transactions, circulatingSupply, exchangeRate, loading, refreshWallet };
};
