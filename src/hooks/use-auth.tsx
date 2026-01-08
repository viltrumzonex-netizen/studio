'use client';

import { createContext, useContext, type ReactNode, useEffect, useCallback } from 'react';
import { create } from 'zustand';
import { useWalletStore } from '@/hooks/use-wallet';
import { createClient } from '@/lib/supabase/client';
import type { AuthChangeEvent, Session, User as SupabaseUser } from '@supabase/supabase-js';

// Define a simpler User type for our app state
export type User = {
  id: string;
  email?: string;
  // Add other user properties you need from Supabase user object
};

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (email: string, password: string, displayName: string) => Promise<any>;
  logout: () => Promise<void>;
  // No need for fetchSession as Supabase handles this
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    loading: true, 
    login: async (email, password) => {
        const supabase = createClient();
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return data;
    },
    register: async (email, password, displayName) => {
        const supabase = createClient();
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    display_name: displayName,
                },
            },
        });
        if (error) throw error;
        // The user object is handled by the onAuthStateChange listener
        return data;
    },
    logout: async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        // The user state will be set to null by the onAuthStateChange listener
    },
}));

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const store = useAuthStore();
    const { loading } = store;

    useEffect(() => {
        const supabase = createClient();
        
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event: AuthChangeEvent, session: Session | null) => {
                const currentUser = session?.user;
                if (currentUser) {
                    const simplifiedUser: User = {
                        id: currentUser.id,
                        email: currentUser.email,
                    };
                    useAuthStore.setState({ user: simplifiedUser, loading: false });
                    // When user is authenticated, fetch their wallet data
                    useWalletStore.getState().fetchWalletData();
                } else {
                    // When user logs out or session expires
                    useAuthStore.setState({ user: null, loading: false });
                    // Clear wallet data as well
                    useWalletStore.getState().reset();
                }
            }
        );

        // Check initial session
        const getInitialSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                 const simplifiedUser: User = {
                    id: session.user.id,
                    email: session.user.email,
                };
                useAuthStore.setState({ user: simplifiedUser, loading: false });
                useWalletStore.getState().fetchWalletData();
            } else {
                useAuthStore.setState({ user: null, loading: false });
            }
        };

        getInitialSession();

        return () => {
            subscription.unsubscribe();
        };
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
