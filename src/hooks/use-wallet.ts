
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
      // Usamos Promise.all para ejecutar todas las consultas en paralelo para máxima eficiencia.
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
        exchangeRate: parseFloat(exchangeRateRes.data?.value) || 36.5,
        loading: false,
      });

    } catch (error: any) {
      console.error('Error al obtener los datos de la billetera:', error.message);
      // En caso de error, reseteamos a un estado conocido y no cargando.
      set({ ...initialState, loading: false });
    }
  },
  reset: () => set({ ...initialState, loading: false }),
}));

// Este hook ahora se encarga de conectar el estado de autenticación con el de la billetera.
export const useWallet = () => {
    const walletState = useWalletStore();
    const { fetchWalletData, reset } = walletState;

    // useEffect se suscribe a los cambios en el store de autenticación.
    useEffect(() => {
        const unsubscribe = useAuthStore.subscribe(
            (state, prevState) => {
                const newUser = state.user;
                const oldUser = prevState.user;

                // Si hay un nuevo usuario (y no es el mismo que antes), obtenemos sus datos.
                if (newUser && newUser.id !== oldUser?.id) {
                    fetchWalletData(newUser);
                } 
                // Si no hay nuevo usuario (cierre de sesión), reseteamos el estado de la billetera.
                else if (!newUser && oldUser) {
                    reset();
                }
            }
        );
        
        // Comprobación inicial al montar el componente, en caso de que ya haya una sesión activa.
        const initialUser = useAuthStore.getState().user;
        if (initialUser) {
            fetchWalletData(initialUser);
        } else {
            // Asegurarse de que si no hay usuario inicial, el estado no se quede en "cargando".
            reset();
        }

        // Limpieza de la suscripción al desmontar.
        return () => {
            unsubscribe();
        };
    // fetchWalletData y reset son estables, por lo que este efecto se ejecuta una sola vez.
    }, [fetchWalletData, reset]);

    const refreshWallet = () => {
        const user = useAuthStore.getState().user;
        if (user) {
            fetchWalletData(user);
        }
    };

    return { ...walletState, refreshWallet };
};
