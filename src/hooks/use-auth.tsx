'use client';

import { createContext, useContext, type ReactNode, useEffect, useCallback } from 'react';
import { create } from 'zustand';
import { useWalletStore } from '@/hooks/use-wallet';

export type User = {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'user';
};

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (email: string, password: string, displayName: string) => Promise<any>;
  logout: () => Promise<void>;
  fetchSession: () => Promise<void>;
}

const useAuthStore = create<AuthState>((set) => ({
    user: null,
    loading: true, 
    fetchSession: async () => {
        set({ loading: true });
        try {
            const response = await fetch('/api/auth/session');
            if (response.ok) {
                const data = await response.json();
                set({ user: data.user });
                // If session exists, fetch wallet data
                useWalletStore.getState().fetchWalletData(data.user.uid);
            } else {
                set({ user: null });
                useWalletStore.getState().reset();
            }
        } catch (e) {
            console.error("Failed to fetch session", e);
            set({ user: null });
            useWalletStore.getState().reset();
        } finally {
            set({ loading: false });
        }
    },
    login: async (email: string, password: string) => {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Error al iniciar sesión.');
        }
        set({ user: data.user, loading: false });
        // Fetch wallet data immediately after successful login
        useWalletStore.getState().fetchWalletData(data.user.uid);
        return data;
    },
    register: async (email: string, password: string, displayName: string) => {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, displayName }),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Error al registrar el usuario.');
        }
        set({ user: data.user, loading: false });
        // Fetch wallet data immediately after successful registration
        useWalletStore.getState().fetchWalletData(data.user.uid);
        return data;
    },
    logout: async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch (error) {
            console.error("Failed to call logout API", error);
        } finally {
            set({ user: null, loading: false });
            // Also reset wallet state on logout
            useWalletStore.getState().reset();
             // Force a full page reload to clear all state from all hooks and libraries.
            window.location.href = '/';
        }
    },
}));

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const store = useAuthStore();
    
    useEffect(() => {
        store.fetchSession();
    }, []);

    return (
        <AuthContext.Provider value={store}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
