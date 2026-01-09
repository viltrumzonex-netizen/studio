
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

export const useWalletStore = create<WalletState>((set) => ({
  ...initialState,
  fetchWalletData: async (user: User) => {
    const supabase = createClient();
    set({ loading: true });

    try {
      const [balanceRes, transactionsRes, circulatingSupplyRes, exchangeRateRes] = await Promise.all([
        supabase.rpc('get_user_balance', { p_user_id: user.id }),
        supabase.from('transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.rpc('get_circulating_supply'),
        supabase.from('config').select('value').eq('key', 'exchange_rate').single()
      ]);
      
      const errors = [balanceRes.error, transactionsRes.error, circulatingSupplyRes.error, exchangeRateRes.error].filter(Boolean);
      if (errors.length > 0) {
        throw new Error(errors.map(e => e?.message).join(', '));
      }

      set({
        balance: balanceRes.data ?? 0,
        transactions: (transactionsRes.data as Transaction[]) ?? [],
        circulatingSupply: circulatingSupplyRes.data ?? 0,
        exchangeRate: parseFloat(exchangeRateRes.data.value) || 36.5,
        loading: false,
      });

    } catch (error: any) {
      console.error('Error fetching wallet data:', error.message);
      // Reset to a non-loading state but keep potentially fetched partial data if needed, or reset completely.
      set({ ...initialState, loading: false });
    }
  },
  reset: () => set({ ...initialState, loading: false }),
}));

export const useWallet = () => {
    const walletState = useWalletStore();
    const { fetchWalletData, reset } = walletState;

    useEffect(() => {
        // Subscribe to auth changes
        const unsubscribe = useAuthStore.subscribe(
            (state, prevState) => {
                const newUser = state.user;
                const oldUser = prevState.user;

                // User logged in
                if (newUser && newUser.id !== oldUser?.id) {
                    fetchWalletData(newUser);
                }
                // User logged out
                else if (!newUser && oldUser) {
                    reset();
                }
            }
        );
        
        // Initial check on mount
        const initialUser = useAuthStore.getState().user;
        if (initialUser) {
            fetchWalletData(initialUser);
        } else {
            // If there's no user on mount, ensure wallet isn't in a loading state.
            reset();
        }

        return () => {
            unsubscribe();
        };
    // fetchWalletData and reset are stable, so this effect runs once on mount.
    }, [fetchWalletData, reset]);

    const refreshWallet = () => {
        const user = useAuthStore.getState().user;
        if (user) {
            fetchWalletData(user);
        }
    };

    return { ...walletState, refreshWallet };
};
