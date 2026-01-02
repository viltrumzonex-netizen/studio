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
  rechargeRequests: RechargeRequest[];
  circulatingSupply: number;
  getVtcBalance: () => number;
  purchaseItem: (amount: number) => void;
  addTransaction: (transaction: Transaction) => void;
  addRechargeRequest: (request: RechargeRequest) => void;
  updateRechargeRequest: (id: string, status: 'approved' | 'denied') => void;
  approveRecharge: (id: string, vtcAmount: number) => void;
}

const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      walletCoins: initialWalletCoins,
      transactions: initialTransactions,
      rechargeRequests: [],
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

      addRechargeRequest: (request) => set(state => ({
        rechargeRequests: [request, ...state.rechargeRequests]
      })),

      updateRechargeRequest: (id, status) => set(state => ({
        rechargeRequests: state.rechargeRequests.map(req => 
            req.id === id ? { ...req, status } : req
        )
      })),

      approveRecharge: (id, vtcAmount) => {
        const request = get().rechargeRequests.find(req => req.id === id);
        if (!request) return;

        set(state => {
            // 1. Update user's VTC balance
            const newWalletCoins = state.walletCoins.map(coin => {
                if (coin.symbol === 'VTC') {
                    return { ...coin, amount: coin.amount + vtcAmount };
                }
                return coin;
            });

            // 2. Add a 'top-up' transaction
            const newTransaction: Transaction = {
                id: `TXN-${uuidv4().slice(0,8)}`,
                type: 'top-up',
                coin: state.walletCoins.find(c => c.symbol === 'VTC')!,
                amount: vtcAmount,
                usdValue: request.amountBs, // Or calculate based on rate
                date: new Date(),
                from: 'Admin Approval'
            };

            // 3. Update the request status
            const newRechargeRequests = state.rechargeRequests.map(req =>
                req.id === id ? { ...req, status: 'approved' as const } : req
            );

            // 4. Update circulating supply
            const newCirculatingSupply = state.circulatingSupply + vtcAmount;

            return {
                walletCoins: newWalletCoins,
                transactions: [newTransaction, ...state.transactions],
                rechargeRequests: newRechargeRequests,
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
      rechargeRequests: [],
      circulatingSupply: initialWalletCoins.reduce((acc, coin) => acc + coin.amount, 0),
      getVtcBalance: () => initialWalletCoins.find(c => c.symbol === 'VTC')?.amount || 0,
      purchaseItem: () => {},
      addTransaction: () => {},
      addRechargeRequest: () => {},
      updateRechargeRequest: () => {},
      approveRecharge: () => {},
  };

  return hydrated ? storedState : initialState;
};

export { useWallet };
