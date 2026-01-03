'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { useWallet as useWalletHook, type useWallet as UseWalletType } from './use-wallet';

// Create a context to hold the wallet state and functions
const WalletContext = createContext<ReturnType<typeof useWalletHook> | undefined>(undefined);

// Create a provider component that will wrap parts of our app
export function WalletProvider({ children }: { children: ReactNode }) {
    const wallet = useWalletHook();
    return (
        <WalletContext.Provider value={wallet}>
            {children}
        </WalletContext.Provider>
    );
}

// Create a custom hook to easily access the wallet context
export const useWallet = () => {
    const context = useContext(WalletContext);
    if (context === undefined) {
        throw new Error('useWallet must be used within a WalletProvider');
    }
    return context;
};
