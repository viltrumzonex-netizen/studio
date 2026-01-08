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

        // Step 1: Sign up the user cleanly.
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
        });

        if (signUpError) throw signUpError;
        if (!authData.user) throw new Error("Registration failed: no user returned.");
        
        // Step 2: Explicitly create the profile after successful sign-up.
        const { error: profileError } = await supabase
            .from('profiles')
            .insert({ 
                id: authData.user.id, 
                display_name: displayName,
                role: 'user' // Default role
            });
        
        if (profileError) {
            // This is a critical error. We should ideally handle cleanup,
            // but for now, we'll throw to make the issue visible.
            throw new Error(`Failed to create user profile: ${profileError.message}`);
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
    const { supabase } = useAuthStore();

    useEffect(() => {
        if (!supabase) {
          useAuthStore.setState({ loading: false });
          return;
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event: AuthChangeEvent, session: Session | null) => {
                const currentUser = session?.user;
                if (currentUser) {
                    // Fetch profile to get role and display name
                    const { data: profile, error: profileError } = await supabase
                        .from('profiles')
                        .select('role, display_name')
                        .eq('id', currentUser.id)
                        .single();
                    
                    if (profileError && profileError.code !== 'PGRST116') { 
                        console.error("Error fetching profile:", profileError);
                    }
                    
                    const simplifiedUser: User = {
                        id: currentUser.id,
                        email: currentUser.email,
                        displayName: profile?.display_name || 'Nuevo Usuario',
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
