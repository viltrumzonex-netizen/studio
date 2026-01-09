
'use client';

import { create } from 'zustand';
import type { Transaction } from '@/lib/types';
import { useAuthStore } from './use-auth';
import { createClient } from '@/lib/supabase/client';

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
    const supabase = createClient();
    const user = useAuthStore.getState().user;

    if (!user) {
      set({ loading: false, balance: 0, transactions: [] });
      return;
    }
    
    set({ loading: true });

    try {
      // Usamos RPC para llamar a las funciones de la base de datos
      const [balanceRes, transactionsRes, circulatingSupplyRes, exchangeRateRes] = await Promise.all([
        supabase.rpc('get_user_balance', { p_user_id: user.id }),
        supabase.from('transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.rpc('get_circulating_supply'),
        supabase.from('config').select('value').eq('key', 'exchange_rate').single()
      ]);

      if (balanceRes.error) throw balanceRes.error;
      if (transactionsRes.error) throw transactionsRes.error;
      if (circulatingSupplyRes.error) throw circulatingSupplyRes.error;
      if (exchangeRateRes.error) throw exchangeRateRes.error;

      set({
        balance: balanceRes.data ?? 0,
        transactions: transactionsRes.data as Transaction[] ?? [],
        circulatingSupply: circulatingSupplyRes.data ?? 0,
        exchangeRate: parseFloat(exchangeRateRes.data.value) || 36.5,
      });

    } catch (error: any) {
      console.error('Error fetching wallet data:', error.message);
      // Mantener los valores por defecto en caso de error, pero indicar que la carga terminó
      set({ balance: 0, transactions: [] });
    } finally {
      set({ loading: false });
    }
  },
  refreshWallet: () => {
    get().fetchWalletData();
  },
  reset: () => set({ balance: 0, transactions: [], circulatingSupply: 0, loading: true, exchangeRate: 36.5 }),
}));

export const useWallet = () => {
    const state = useWalletStore();
    return state;
};
