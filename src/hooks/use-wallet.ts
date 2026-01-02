'use client';

import { create } from 'zustand';
import type { Transaction } from '@/lib/types';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './use-auth';

interface WalletState {
  balance: number;
  transactions: Transaction[];
  circulatingSupply: number;
  exchangeRate: number;
  loading: boolean;
  refreshWallet: () => void;
  setBalance: (balance: number) => void;
  setTransactions: (transactions: Transaction[]) => void;
  setExchangeRate: (rate: number) => void;
}

const useWalletStore = create<WalletState>()((set) => ({
  balance: 0,
  transactions: [],
  circulatingSupply: 0,
  exchangeRate: 36.5, // Default/initial value
  loading: true,
  refreshWallet: () => { console.log("Placeholder for refresh") },
  setBalance: (balance) => set({ balance }),
  setTransactions: (transactions) => set({ transactions }),
  setExchangeRate: (rate) => set({ exchangeRate: rate }),
}));

// Custom hook to handle hydration and data fetching
export const useWallet = () => {
  const { user } = useAuth();
  const { 
    balance, 
    transactions, 
    circulatingSupply, 
    exchangeRate,
    loading, 
    setBalance, 
    setTransactions,
    setExchangeRate 
  } = useWalletStore();
  
  const [hydrated, setHydrated] = useState(false);

  const fetchWalletData = useCallback(async () => {
    if (!user?.uid) return;
    
    useWalletStore.setState({ loading: true });
    try {
      const walletRes = await fetch(`/api/wallet/balance?userId=${user.uid}`);
      const walletData = await walletRes.json();
      if (walletRes.ok) {
        setBalance(walletData.balance);
        setTransactions(walletData.transactions);
      } else {
        throw new Error(walletData.message || 'Failed to fetch wallet data');
      }

      const settingsRes = await fetch('/api/settings');
      const settingsData = await settingsRes.json();
      if(settingsRes.ok) {
        const rateSetting = settingsData.find((s: any) => s.setting_key === 'exchange_rate');
        if (rateSetting) {
          setExchangeRate(parseFloat(rateSetting.setting_value));
        }
      } else {
        throw new Error(settingsData.message || 'Failed to fetch settings');
      }

    } catch (error) {
      console.error(error);
      // Handle error (e.g., show toast)
    } finally {
      useWalletStore.setState({ loading: false });
    }
  }, [user?.uid, setBalance, setTransactions, setExchangeRate]);

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
      exchangeRate: 36.5,
      loading: true,
      refreshWallet: () => {},
  };

  if (!hydrated) {
    return initialState;
  }
  
  // Attach the real refresh function to the store instance
  useWalletStore.setState({ refreshWallet });

  return { balance, transactions, circulatingSupply, exchangeRate, loading, refreshWallet };
};
