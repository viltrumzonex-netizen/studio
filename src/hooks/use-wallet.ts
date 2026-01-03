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
      const [walletRes, settingsRes, supplyRes] = await Promise.all([
        fetch(`/api/wallet/balance`, { credentials: 'include' }),
        fetch('/api/settings', { credentials: 'include' }),
        fetch('/api/wallet/supply', { credentials: 'include' })
      ]);

      if (!walletRes.ok) {
        // If wallet balance fails, it's a critical error (likely unauthenticated)
        const errorData = await walletRes.json();
        throw new Error(errorData.message || 'Error de autenticación al obtener datos del monedero.');
      }

      const walletData = await walletRes.json();
      const settingsData = settingsRes.ok ? await settingsRes.json() : [];
      const supplyData = supplyRes.ok ? await supplyRes.json() : { circulatingSupply: 0 };
      
      const rateSetting = settingsData.find((s: any) => s.setting_key === 'exchange_rate');
      const newExchangeRate = rateSetting ? parseFloat(rateSetting.setting_value) : get().exchangeRate;

      set({
        balance: walletData.balance || 0,
        transactions: walletData.transactions || [],
        exchangeRate: newExchangeRate,
        circulatingSupply: supplyData.circulatingSupply || 0,
      });

    } catch (error) {
      console.error("Failed to fetch wallet data:", error);
      // On error, reset to a clean, non-authenticated state
      set({ balance: 0, transactions: [], loading: false, circulatingSupply: 0 });
    } finally {
      set({ loading: false });
    }
  },
  reset: () => set({ balance: 0, transactions: [], circulatingSupply: 0, loading: true, exchangeRate: 36.5 }),
}));

export const useWallet = () => {
  const { user, loading: authLoading } = useAuth();
  const state = useWalletStore();

  useEffect(() => {
    // If auth is loading, do nothing yet.
    if (authLoading) {
      return; 
    }
    
    // If auth is done and we have a user, fetch their data.
    if (user?.uid) {
      state.fetchWalletData(user.uid);
    } else {
      // If auth is done and there's NO user, reset the wallet state.
      state.reset();
    }
  }, [user?.uid, authLoading, state.fetchWalletData, state.reset]);

  const refreshWallet = useCallback(() => {
    if (user?.uid && !authLoading) {
      state.fetchWalletData(user.uid);
    }
  }, [user?.uid, authLoading, state.fetchWalletData]);

  return {
    ...state,
    loading: authLoading || state.loading,
    refreshWallet,
  };
};
