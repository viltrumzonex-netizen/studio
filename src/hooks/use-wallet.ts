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
    // This function now assumes userId is valid.
    set({ loading: true });
    try {
      const [walletRes, settingsRes, supplyRes] = await Promise.all([
        fetch(`/api/wallet/balance`, { credentials: 'include' }),
        fetch('/api/settings', { credentials: 'include' }),
        fetch('/api/wallet/supply', { credentials: 'include' })
      ]);

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
      });

    } catch (error) {
      console.error("Failed to fetch wallet data:", error);
      get().reset(); // Reset on error
    } finally {
        set({ loading: false });
    }
  },
  reset: () => set({ balance: 0, transactions: [], circulatingSupply: 0, loading: false, exchangeRate: 36.5 }),
}));

export const useWallet = () => {
    const { user, loading: authLoading } = useAuth();
    const { fetchWalletData, reset, ...walletState } = useWalletStore();

    // This effect synchronizes the wallet state with the authentication state.
    useEffect(() => {
        // If auth is done loading...
        if (!authLoading) {
            // ...and we have a user, fetch their data.
            if (user?.uid) {
                fetchWalletData(user.uid);
            } 
            // ...and there's no user, reset the wallet state.
            else {
                reset();
            }
        }
    }, [user, authLoading, fetchWalletData, reset]);

    const refreshWallet = useCallback(() => {
        if (user?.uid) {
            fetchWalletData(user.uid);
        }
    }, [user?.uid, fetchWalletData]);

    return {
        ...walletState,
        // The wallet is loading if auth is loading OR if wallet data is being fetched.
        loading: authLoading || walletState.loading,
        refreshWallet,
    };
};
