
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
      // En caso de error, resetea al estado inicial pero indica que la carga ha terminado.
      set({ ...initialState, loading: false });
    }
  },
  reset: () => set(initialState),
}));

// Este es el hook que los componentes usarán.
// Se encarga de la lógica de "efecto" para reaccionar a los cambios de autenticación.
export const useWallet = () => {
    // Obtiene todo el estado de la billetera del store de Zustand.
    const walletState = useWalletStore();

    useEffect(() => {
        // Nos suscribimos a los cambios en el store de autenticación.
        const unsubscribe = useAuthStore.subscribe(
            (state, prevState) => {
                const newUser = state.user;
                const oldUser = prevState.user;

                // Si hay un nuevo usuario y antes no lo había, cargamos sus datos.
                if (newUser && !oldUser) {
                    walletState.fetchWalletData(newUser);
                } 
                // Si ya no hay usuario y antes sí lo había (cierre de sesión), reseteamos la billetera.
                else if (!newUser && oldUser) {
                    walletState.reset();
                }
            }
        );
        
        // Comprobar el estado inicial al montar el componente.
        // Si la página se carga y el usuario ya está en el estado, cargamos su billetera.
        const initialUser = useAuthStore.getState().user;
        if (initialUser) {
            walletState.fetchWalletData(initialUser);
        } else {
            // Si no hay usuario inicial, nos aseguramos de que no se quede en "cargando".
            useWalletStore.setState({ loading: false });
        }

        // Limpiamos la suscripción cuando el componente que usa el hook se desmonta.
        return () => {
            unsubscribe();
        };
    // El array de dependencias vacío asegura que este efecto solo se ejecute una vez por componente.
    }, []);

    // La función para refrescar manualmente la billetera.
    const refreshWallet = () => {
        const user = useAuthStore.getState().user;
        if (user) {
            walletState.fetchWalletData(user);
        }
    };

    // Devolvemos el estado de la billetera y la función de refresco.
    return { ...walletState, refreshWallet };
};
