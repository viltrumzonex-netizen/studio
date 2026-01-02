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
    set({ loading: true });
    try {
      if (!userId) {
        set({ balance: 0, transactions: [], loading: false, circulatingSupply: 0 });
        return;
      }
      
      const [walletRes, settingsRes, supplyRes] = await Promise.all([
        fetch(`/api/wallet/balance`, { credentials: 'include' }),
        fetch('/api/settings', { credentials: 'include' }),
        fetch('/api/wallet/supply', { credentials: 'include' })
      ]);

      const walletData = walletRes.ok ? await walletRes.json() : { balance: 0, transactions: [] };
      const settingsData = settingsRes.ok ? await settingsRes.json() : [];
      const supplyData = supplyRes.ok ? await supplyRes.json() : { circulatingSupply: 0 };
      
      const rateSetting = settingsData.find((s: any) => s.setting_key === 'exchange_rate');
      const newExchangeRate = rateSetting ? parseFloat(rateSetting.setting_value) : 36.5;

      set({
        balance: walletData.balance || 0,
        transactions: walletData.transactions || [],
        exchangeRate: newExchangeRate,
        circulatingSupply: supplyData.circulatingSupply || 0,
      });

    } catch (error) {
      console.error("Failed to fetch wallet data:", error);
      set({ balance: 0, transactions: [], loading: false });
    } finally {
      set({ loading: false });
    }
  },
  reset: () => set({ balance: 0, transactions: [], circulatingSupply: 0, loading: true }),
}));

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
    if (authLoading) {
      return; 
    }
    if (user?.uid) {
      fetchWalletData(user.uid);
    } else {
      reset();
    }
  }, [user?.uid, authLoading, fetchWalletData, reset]);

  const refreshWallet = useCallback(() => {
    if (user?.uid && !authLoading) {
      fetchWalletData(user.uid);
    }
  }, [user?.uid, authLoading, fetchWalletData]);

  const loading = authLoading || walletLoading;

  return { balance, transactions, circulatingSupply, exchangeRate, loading, refreshWallet };
};
