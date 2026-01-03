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

const useWalletStore = create<WalletState>((set, get) => ({
  balance: 0,
  transactions: [],
  circulatingSupply: 0,
  exchangeRate: 36.5, // Default/initial value
  loading: true,
  fetchWalletData: async (userId: string) => {
    if (!userId) {
      set({ balance: 0, transactions: [], loading: false });
      return;
    }
    set({ loading: true });
    try {
      // Use Promise.all to fetch all required data in parallel
      const [walletRes, settingsRes, supplyRes] = await Promise.all([
        fetch(`/api/wallet/balance`, { credentials: 'include' }),
        fetch('/api/settings', { credentials: 'include' }),
        fetch('/api/wallet/supply', { credentials: 'include' })
      ]);

      // Process successful responses, allow non-critical ones to fail gracefully
      const walletData = walletRes.ok ? await walletRes.json() : { balance: 0, transactions: [] };
      const settingsData = settingsRes.ok ? await settingsRes.json() : [];
      const supplyData = supplyRes.ok ? await supplyRes.json() : { circulatingSupply: 0 };
      
      const rateSetting = settingsData.find((s: any) => s.setting_key === 'exchange_rate');
      const newExchangeRate = rateSetting ? parseFloat(rateSetting.setting_value) : get().exchangeRate;

      set({
        balance: walletData.balance || 0,
        transactions: walletData.transactions || [],
        exchangeRate: newExchangeRate,
        circulatingSupply: supplyData.circulatingSupply || 0,
        loading: false
      });

    } catch (error) {
      console.error("Failed to fetch wallet data:", error);
      // On any error, reset to a clean, non-authenticated state
      get().reset();
    }
  },
  reset: () => set({ balance: 0, transactions: [], circulatingSupply: 0, loading: false, exchangeRate: 36.5 }),
}));


export const useWallet = () => {
  const { user, loading: authLoading } = useAuth();
  const { fetchWalletData, reset, ...walletState } = useWalletStore();

  useEffect(() => {
    if (user?.uid) {
      fetchWalletData(user.uid);
    } else if (!authLoading) {
      // If auth is done and there's no user, reset the wallet.
      reset();
    }
  }, [user, authLoading, fetchWalletData, reset]);

  const refreshWallet = useCallback(() => {
    if (user?.uid) {
      fetchWalletData(user.uid);
    }
  }, [user?.uid, fetchWalletData]);

  // The wallet is loading if either the auth check is running OR the wallet data fetch is running.
  return {
    ...walletState,
    loading: authLoading || walletState.loading,
    refreshWallet,
  };
};
