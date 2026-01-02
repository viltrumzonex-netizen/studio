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
      // If no user, we shouldn't even call this, but as a safeguard:
      if (!userId) {
        set({ balance: 0, transactions: [], loading: false });
        return;
      }
      
      const [walletRes, settingsRes, supplyRes] = await Promise.all([
        fetch(`/api/wallet/balance?userId=${userId}`),
        fetch('/api/settings'),
        fetch('/api/wallet/supply')
      ]);

      // Process results even if some fail
      const walletData = walletRes.ok ? await walletRes.json() : { balance: 0, transactions: [] };
      const settingsData = settingsRes.ok ? await settingsRes.json() : [];
      const supplyData = supplyRes.ok ? await supplyRes.json() : { circulatingSupply: 0 };
      
      const rateSetting = settingsData.find((s: any) => s.setting_key === 'exchange_rate');
      const newExchangeRate = rateSetting ? parseFloat(rateSetting.setting_value) : 36.5;

      set({
        balance: walletData.balance,
        transactions: walletData.transactions,
        exchangeRate: newExchangeRate,
        circulatingSupply: supplyData.circulatingSupply,
      });

    } catch (error) {
      console.error("Failed to fetch wallet data:", error);
      set({ balance: 0, transactions: [] }); // Reset on error
    } finally {
      set({ loading: false });
    }
  },
  reset: () => set({ balance: 0, transactions: [], circulatingSupply: 0, loading: false }),
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
    // This effect synchronizes wallet data fetching with the user's auth state.
    // It only runs when the authentication process is complete (authLoading is false).
    if (!authLoading) {
      if (user?.uid) {
        // If there's a user, fetch their wallet data.
        fetchWalletData(user.uid);
      } else {
        // If there's no user, reset the wallet state to its initial empty state.
        reset();
      }
    }
  }, [user?.uid, authLoading, fetchWalletData, reset]);


  // The manual refresh function remains available for components.
  const refreshWallet = useCallback(() => {
    if (user?.uid) {
      fetchWalletData(user.uid);
    }
  }, [user?.uid, fetchWalletData]);

  // Consolidate loading state. The app is "loading" if auth is loading OR the wallet is loading.
  const loading = authLoading || walletLoading;

  return { balance, transactions, circulatingSupply, exchangeRate, loading, refreshWallet };
};
