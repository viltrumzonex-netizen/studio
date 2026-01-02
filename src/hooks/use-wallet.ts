'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Coin, Transaction } from '@/lib/types';
import { walletCoins as initialWalletCoins, transactions as initialTransactions } from '@/lib/mock-data';
import { useState, useEffect } from 'react';

interface WalletState {
  walletCoins: Coin[];
  transactions: Transaction[];
  circulatingSupply: number;
  getVtcBalance: () => number;
  purchaseItem: (amount: number) => void;
  addTransaction: (transaction: Transaction) => void;
}

const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      walletCoins: initialWalletCoins,
      transactions: initialTransactions,
      circulatingSupply: initialWalletCoins.reduce((acc, coin) => acc + coin.amount, 0),
      
      getVtcBalance: () => {
        const vtc = get().walletCoins.find(c => c.symbol === 'VTC');
        return vtc ? vtc.amount : 0;
      },

      purchaseItem: (amount) => set((state) => {
        const newWalletCoins = state.walletCoins.map(coin => {
            if (coin.symbol === 'VTC') {
                return { ...coin, amount: coin.amount - amount };
            }
            return coin;
        });
        return { walletCoins: newWalletCoins };
      }),

      addTransaction: (transaction) => set((state) => ({
        transactions: [transaction, ...state.transactions],
      })),

    }),
    {
      name: 'viltrum-wallet-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Custom hook to handle hydration issues
const useWallet = () => {
  const storedState = useWalletStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const initialState = {
      walletCoins: initialWalletCoins,
      transactions: initialTransactions,
      circulatingSupply: initialWalletCoins.reduce((acc, coin) => acc + coin.amount, 0),
      getVtcBalance: () => initialWalletCoins.find(c => c.symbol === 'VTC')?.amount || 0,
      purchaseItem: () => {},
      addTransaction: () => {},
  };

  return hydrated ? storedState : initialState;
};

export { useWallet };
