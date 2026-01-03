'use client';

import { create } from 'zustand';
import type { Transaction } from '@/lib/types';
import { useAuthStore } from './use-auth';

interface WalletState {
  balance: number;
  transactions: Transaction[];
  circulatingSupply: number;
  exchangeRate: number;
  loading: boolean;
  fetchWalletData: () => Promise<void>;
  refreshWallet: () => void;
  reset: () => void;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  balance: 0,
  transactions: [],
  circulatingSupply: 0,
  exchangeRate: 36.5,
  loading: true,
  fetchWalletData: async () => {
    // Ensure we don't fetch if there's no user.
    const user = useAuthStore.getState().user;
    if (!user) {
      set({ loading: false });
      return;
    }

    set({ loading: true });
    try {
      const [walletRes, settingsRes, supplyRes] = await Promise.all([
        fetch('/api/wallet/balance', { credentials: 'include' }),
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
  refreshWallet: () => {
    get().fetchWalletData();
  },
  reset: () => set({ balance: 0, transactions: [], circulatingSupply: 0, loading: false, exchangeRate: 36.5 }),
}));

export const useWallet = () => {
    const state = useWalletStore();
    return state;
};
