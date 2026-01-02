'use client';

import { create } from 'zustand';
import type { Transaction } from '@/lib/types';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './use-auth';

interface WalletState {
  balance: number;
  transactions: Transaction[];
  circulatingSupply: number;
  loading: boolean;
  refreshWallet: () => void;
  setBalance: (balance: number) => void;
  setTransactions: (transactions: Transaction[]) => void;
}

const useWalletStore = create<WalletState>()((set) => ({
  balance: 0,
  transactions: [],
  circulatingSupply: 0, // This will be fetched globally
  loading: true,
  refreshWallet: () => { console.log("Placeholder for refresh") },
  setBalance: (balance) => set({ balance }),
  setTransactions: (transactions) => set({ transactions }),
}));

// Custom hook to handle hydration and data fetching
export const useWallet = () => {
  const { user } = useAuth();
  const { balance, transactions, circulatingSupply, loading, setBalance, setTransactions } = useWalletStore();
  const [hydrated, setHydrated] = useState(false);

  const fetchWalletData = useCallback(async () => {
    if (!user?.uid) return;
    
    useWalletStore.setState({ loading: true });
    try {
      const res = await fetch(`/api/wallet/balance?userId=${user.uid}`);
      const data = await res.json();
      if (res.ok) {
        setBalance(data.balance);
        setTransactions(data.transactions);
      } else {
        throw new Error(data.message || 'Failed to fetch wallet data');
      }
    } catch (error) {
      console.error(error);
      // Handle error (e.g., show toast)
    } finally {
      useWalletStore.setState({ loading: false });
    }
  }, [user?.uid, setBalance, setTransactions]);

  useEffect(() => {
    setHydrated(true);
    if (user) {
      fetchWalletData();
    }
  }, [user, fetchWalletData]);

  // Expose a manual refresh function
  const refreshWallet = useCallback(() => {
    fetchWalletData();
  }, [fetchWalletData]);

  const initialState = {
      balance: 0,
      transactions: [],
      circulatingSupply: 0,
      loading: true,
      refreshWallet: () => {},
      setBalance: () => {},
      setTransactions: () => {},
  };

  if (!hydrated) {
    return initialState;
  }
  
  // Attach the real refresh function to the store instance
  useWalletStore.setState({ refreshWallet });

  return { balance, transactions, circulatingSupply, loading, refreshWallet };
};
