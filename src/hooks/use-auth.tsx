'use client';

import { createContext, useContext, type ReactNode, useEffect } from 'react';
import { create } from 'zustand';
import { useWalletStore } from '@/hooks/use-wallet';
import { createClient } from '@/lib/supabase/client';
import type { AuthChangeEvent, Session, SupabaseClient, User as SupabaseUser } from '@supabase/supabase-js';

// Define a simpler User type for our app state
export type User = {
  id: string;
  email?: string;
  displayName?: string;
  role?: string;
};

interface AuthState {
  user: User | null;
  loading: boolean;
  supabase: SupabaseClient | null,
  login: (email: string, password: string) => Promise<any>;
  register: (email: string, password: string, displayName: string) => Promise<any>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    loading: true, 
    supabase: createClient(),
    login: async (email, password) => {
        const supabase = get().supabase;
        if (!supabase) throw new Error("Supabase client is not initialized.");
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // User state will be set by onAuthStateChange
        return data;
    },
    register: async (email, password, displayName) => {
        const supabase = get().supabase;
        if (!supabase) throw new Error("Supabase client is not initialized.");

        // Step 1: Sign up the user in Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    display_name: displayName,
                },
            },
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error("Registration failed: no user data returned.");

        // Step 2: Insert the profile into the public.profiles table
        const { error: profileError } = await supabase.from('profiles').insert({
            id: authData.user.id,
            display_name: displayName,
            role: 'user'
        });

        if (profileError) {
            // This is a critical error. We should ideally handle this gracefully,
            // maybe by deleting the auth user or notifying an admin.
            // For now, we'll throw the error to make it visible.
            throw profileError;
        }

        // The onAuthStateChange listener will handle setting the user state.
        return authData;
    },
    logout: async () => {
        const supabase = get().supabase;
        if (!supabase) throw new Error("Supabase client is not initialized.");
        await supabase.auth.signOut();
        // The user state will be set to null by the onAuthStateChange listener
    },
}));

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const { supabase, loading } = useAuthStore();

    useEffect(() => {
        if (!supabase) {
          useAuthStore.setState({ loading: false });
          return;
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event: AuthChangeEvent, session: Session | null) => {
                const currentUser = session?.user;
                if (currentUser) {
                    // Fetch profile to get role
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('role, display_name')
                        .eq('id', currentUser.id)
                        .single();

                    const simplifiedUser: User = {
                        id: currentUser.id,
                        email: currentUser.email,
                        displayName: profile?.display_name || currentUser.user_metadata.display_name,
                        role: profile?.role || 'user'
                    };
                    useAuthStore.setState({ user: simplifiedUser, loading: false });
                    useWalletStore.getState().fetchWalletData();
                } else {
                    useAuthStore.setState({ user: null, loading: false });
                    useWalletStore.getState().reset();
                }
            }
        );

        // Check initial session
        const getInitialSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                 const { data: profile } = await supabase
                    .from('profiles')
                    .select('role, display_name')
                    .eq('id', session.user.id)
                    .single();

                 const simplifiedUser: User = {
                    id: session.user.id,
                    email: session.user.email,
                    displayName: profile?.display_name || session.user.user_metadata.display_name,
                    role: profile?.role || 'user'
                };
                useAuthStore.setState({ user: simplifiedUser, loading: false });
                useWalletStore.getState().fetchWalletData();
            } else {
                useAuthStore.setState({ user: null, loading: false });
            }
        };

        getInitialSession();

        return () => {
            subscription?.unsubscribe();
        };
    }, [supabase]);

    return (
        <AuthContext.Provider value={useAuthStore(state => state)}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  // This now returns the Zustand store's state
  return context;
};
