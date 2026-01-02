'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Coin, Transaction, RechargeRequest } from '@/lib/types';
import { walletCoins as initialWalletCoins, transactions as initialTransactions } from '@/lib/mock-data';
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface WalletState {
  walletCoins: Coin[];
  transactions: Transaction[];
  circulatingSupply: number;
  getVtcBalance: () => number;
  purchaseItem: (amount: number) => void;
  addTransaction: (transaction: Transaction) => void;
  approveRecharge: (id: string, vtcAmount: number, userId: string) => void;
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
      
      // Note: Recharge request management is now handled via API and database.
      // This state hook will now only handle the *result* of an approved recharge.
      approveRecharge: (id, vtcAmount, userId) => {
        // This function will be called AFTER the API confirms the approval.
        // It's responsible for updating the client-side state.
        set(state => {
            // In a full DB implementation, this would re-fetch the user's balance.
            // For now, we simulate the update.
            const newWalletCoins = state.walletCoins.map(coin => {
                if (coin.symbol === 'VTC') {
                    return { ...coin, amount: coin.amount + vtcAmount };
                }
                return coin;
            });

            const newTransaction: Transaction = {
                id: `TXN-${uuidv4().slice(0,8)}`,
                type: 'top-up',
                coin: state.walletCoins.find(c => c.symbol === 'VTC')!,
                amount: vtcAmount,
                usdValue: vtcAmount, // Placeholder
                date: new Date(),
                from: 'Recarga Aprobada'
            };

            const newCirculatingSupply = state.circulatingSupply + vtcAmount;

            return {
                walletCoins: newWalletCoins,
                transactions: [newTransaction, ...state.transactions],
                circulatingSupply: newCirculatingSupply,
            };
        });
      }
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

  const initialState: WalletState = {
      walletCoins: initialWalletCoins,
      transactions: initialTransactions,
      circulatingSupply: initialWalletCoins.reduce((acc, coin) => acc + coin.amount, 0),
      getVtcBalance: () => initialWalletCoins.find(c => c.symbol === 'VTC')?.amount || 0,
      purchaseItem: () => {},
      addTransaction: () => {},
      approveRecharge: () => {},
  };

  return hydrated ? storedState : initialState;
};

export { useWallet };
