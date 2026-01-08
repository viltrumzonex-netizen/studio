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
    // This function will be re-implemented with Supabase
    set({ loading: false });
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
