
'use client';

import { createContext, useContext, type ReactNode, useEffect, useState } from 'react';
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
  supabase: SupabaseClient;
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
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // User state will be set by onAuthStateChange
        return data;
    },
    register: async (email, password, displayName) => {
        const supabase = get().supabase;
        // The display name will be used by the onAuthStateChange listener to create the profile
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) throw error;
        // The profile will be created by the onAuthStateChange listener
        // to avoid race conditions and permissions issues.
        return data;
    },
    logout: async () => {
        const supabase = get().supabase;
        await supabase.auth.signOut();
    },
}));

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const { supabase } = useAuthStore();
    const [lastDisplayName, setLastDisplayName] = useState<string | null>(null);

     useEffect(() => {
        const originalRegister = useAuthStore.getState().register;
        // Monkey-patch register to capture displayName
        useAuthStore.setState({
            register: async (email, password, displayName) => {
                setLastDisplayName(displayName);
                return originalRegister(email, password, displayName);
            }
        });
    }, []);

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event: AuthChangeEvent, session: Session | null) => {
                const currentUser = session?.user;
                if (currentUser) {
                    // Fetch profile to get role and display name
                    let { data: profile, error: profileError } = await supabase
                        .from('profiles')
                        .select('role, display_name')
                        .eq('id', currentUser.id)
                        .single();
                    
                    // If profile doesn't exist, create it (likely a new user)
                    if (profileError && profileError.code === 'PGRST116') {
                        const { data: newProfile, error: insertError } = await supabase
                            .from('profiles')
                            .insert({
                                id: currentUser.id,
                                display_name: 'Nuevo Usuario', // Default name
                                role: 'user'
                            })
                            .select()
                            .single();
                        
                        if (insertError) {
                            console.error("Error creating profile:", insertError);
                        } else {
                            profile = newProfile;
                        }
                    } else if (profileError) {
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
    }, [supabase, lastDisplayName]);

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
  return context;
};
