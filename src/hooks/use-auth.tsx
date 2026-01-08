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

        // Step 1: Sign up the user with email and password only.
        // We pass the displayName in the options to have it available in the auth user object later
        // but we will NOT rely on triggers.
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    display_name: displayName,
                }
            }
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error("Registration failed: no user data returned.");

        // The onAuthStateChange listener will handle profile creation.
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
                    
                    if (profileError && profileError.code !== 'PGRST116') { // PGRST116 = 'exact one row not found'
                        console.error("Error fetching profile:", profileError);
                        useAuthStore.setState({ user: null, loading: false });
                        return;
                    }

                    // If a user exists in auth but not in profiles, it's a fresh signup. Create the profile.
                    if (!profile) {
                         const { error: insertError } = await supabase.from('profiles').insert({
                            id: currentUser.id,
                            display_name: currentUser.user_metadata.display_name || 'Nuevo Usuario',
                            role: 'user'
                        });

                        if (insertError) {
                            console.error("Error creating profile:", insertError);
                            // Log out the user if profile creation fails to prevent inconsistent state
                            await supabase.auth.signOut();
                            useAuthStore.setState({ user: null, loading: false });
                            return;
                        }
                        
                        // Re-fetch profile after creation to get the final state
                        const { data: newProfile } = await supabase.from('profiles').select('role, display_name').eq('id', currentUser.id).single();
                        
                        const simplifiedUser: User = {
                            id: currentUser.id,
                            email: currentUser.email,
                            displayName: newProfile?.display_name,
                            role: newProfile?.role
                        };
                         useAuthStore.setState({ user: simplifiedUser, loading: false });

                    } else {
                         const simplifiedUser: User = {
                            id: currentUser.id,
                            email: currentUser.email,
                            displayName: profile.display_name,
                            role: profile.role
                        };
                        useAuthStore.setState({ user: simplifiedUser, loading: false });
                    }
                    
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
