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
        loading: false,
      });

    } catch (error: any) {
      console.error('Error fetching wallet data:', error.message);
      set({ ...initialState, loading: false });
    }
  },
  reset: () => set(initialState),
}));

// Este hook se suscribe a los cambios de autenticación para cargar/limpiar los datos de la billetera.
export const useWallet = () => {
    const walletState = useWalletStore();

    useEffect(() => {
        const unsubscribe = useAuthStore.subscribe(
            (state, prevState) => {
                // Usuario ha iniciado sesión
                if (state.user && !prevState.user) {
                    walletState.fetchWalletData(state.user);
                }
                // Usuario ha cerrado sesión
                else if (!state.user && prevState.user) {
                    walletState.reset();
                }
            }
        );

        // Comprobar estado inicial en caso de que la página se cargue con un usuario ya logueado
        const initialUser = useAuthStore.getState().user;
        if (initialUser) {
            walletState.fetchWalletData(initialUser);
        } else {
             // Si no hay usuario inicial, nos aseguramos de que la billetera no esté en estado de carga
            useWalletStore.setState({ loading: false });
        }


        return () => {
            unsubscribe();
        };
    }, [walletState.fetchWalletData, walletState.reset]);

    // Exponer una función de actualización manual
    const refreshWallet = () => {
        const user = useAuthStore.getState().user;
        if (user) {
            walletState.fetchWalletData(user);
        }
    };

    return { ...walletState, refreshWallet };
};
