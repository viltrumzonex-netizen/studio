
'use client';

import { createContext, useContext, type ReactNode, useEffect } from 'react';
import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import type { SupabaseClient, Session } from '@supabase/supabase-js';

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

const supabaseClient = createClient();

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    loading: true, 
    supabase: supabaseClient,
    login: async (email, password) => {
        const { data, error } = await get().supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return data;
    },
    register: async (email, password, displayName) => {
        const { data, error } = await get().supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    display_name: displayName,
                }
            }
        });
        if (error) throw error;
        return data;
    },
    logout: async () => {
        await get().supabase.auth.signOut();
    },
}));

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const store = useAuthStore();

    useEffect(() => {
        const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_OUT' || !session) {
                useAuthStore.setState({ user: null, loading: false });
                return;
            }
            
            if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
                useAuthStore.setState({ loading: true });
                try {
                    const { data: profile, error: profileError } = await supabaseClient
                        .from('profiles')
                        .select('role, display_name')
                        .eq('id', session.user.id)
                        .limit(1) // Ensure we only ever get one row.
                        .single(); // Fails if not exactly one row is returned (or zero if `maybeSingle` is used)

                    if (profileError) {
                        // This error will be thrown if RLS prevents access or if more than one row is found.
                        throw new Error(`No se pudo obtener el perfil: ${profileError.message}`);
                    }
                    
                    const simplifiedUser: User = {
                        id: session.user.id,
                        email: session.user.email,
                        displayName: profile.display_name || 'Nuevo Usuario',
                        role: profile.role || 'user'
                    };
                    
                    useAuthStore.setState({ user: simplifiedUser, loading: false });

                } catch (error) {
                    console.error("Error crítico durante la obtención del perfil, cerrando sesión:", error);
                    await supabaseClient.auth.signOut();
                    useAuthStore.setState({ user: null, loading: false });
                }
            }
        });

        return () => {
            subscription?.unsubscribe();
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
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return useAuthStore();
};
