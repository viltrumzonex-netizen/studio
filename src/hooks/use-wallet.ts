
'use client';

import { create } from 'zustand';
import type { Transaction } from '@/lib/types';
import { useAuthStore, type User } from './use-auth';
import { createClient } from '@/lib/supabase/client';
import { useEffect } from 'react';

interface WalletState {
  balance: number;
  transactions: Transaction[];
  circulatingSupply: number;
  exchangeRate: number;
  loading: boolean;
  fetchWalletData: (user: User) => Promise<void>;
  reset: () => void;
}

const initialState = {
  balance: 0,
  transactions: [],
  circulatingSupply: 0,
  exchangeRate: 36.5,
  loading: true,
};

export const useWalletStore = create<WalletState>((set, get) => ({
  ...initialState,
  fetchWalletData: async (user: User) => {
    const supabase = createClient();
    if (!user) {
      set({ ...initialState, loading: false });
      return;
    }
    
    set({ loading: true });

    try {
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
      set({ ...initialState, loading: false });
    } finally {
      set({ loading: false });
    }
  },
  reset: () => set(initialState),
}));


// Custom hook que reacciona a los cambios de autenticación
export const useWallet = () => {
    const walletState = useWalletStore();
    const { user, loading: authLoading } = useAuthStore();

    useEffect(() => {
        if (user && !authLoading) {
            walletState.fetchWalletData(user);
        } else if (!user && !authLoading) {
            walletState.reset();
        }
    }, [user, authLoading]);

    // Exponer una función de actualización manual
    const refreshWallet = () => {
        if (user) {
            walletState.fetchWalletData(user);
        }
    };

    return { ...walletState, refreshWallet };
};
