
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
        transactions: (transactionsRes.data as Transaction[]) ?? [],
        circulatingSupply: circulatingSupplyRes.data ?? 0,
        exchangeRate: parseFloat(exchangeRateRes.data.value) || 36.5,
        loading: false,
      });

    } catch (error: any) {
      console.error('Error fetching wallet data:', error.message);
      set({ ...initialState, loading: false, exchangeRate: 36.5 }); // Resetea pero mantiene una tasa por defecto
    }
  },
  reset: () => set(initialState),
}));


export const useWallet = () => {
    const walletState = useWalletStore();
    const { fetchWalletData, reset } = useWalletStore.getState();

    useEffect(() => {
        const unsubscribe = useAuthStore.subscribe(
            (state, prevState) => {
                const newUser = state.user;
                const oldUser = prevState.user;

                // Solo actuar si el ID de usuario cambia
                if (newUser?.id !== oldUser?.id) {
                    if (newUser) {
                        fetchWalletData(newUser);
                    } else {
                        reset();
                    }
                }
            }
        );
        
        // Comprobar estado inicial en el montaje
        const initialUser = useAuthStore.getState().user;
        if (initialUser) {
            fetchWalletData(initialUser);
        } else {
             // Asegurarse de que no se quede cargando si no hay usuario inicial
            useWalletStore.setState({ loading: false });
        }

        return () => {
            unsubscribe();
        };
    // El array de dependencias vacío es correcto aquí para que el efecto se ejecute solo una vez
    // y establezca la suscripción. Las actualizaciones son manejadas por la suscripción misma.
    }, [fetchWalletData, reset]);

    const refreshWallet = () => {
        const user = useAuthStore.getState().user;
        if (user) {
            fetchWalletData(user);
        }
    };

    return { ...walletState, refreshWallet };
};
