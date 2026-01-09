
'use client';

import { createContext, useContext, type ReactNode, useEffect, useCallback } from 'react';
import { create } from 'zustand';
import { useWalletStore } from '@/hooks/use-wallet';
import { createClient } from '@/lib/supabase/client';
import type { AuthChangeEvent, Session, SupabaseClient, User as SupabaseUser } from '@supabase/supabase-js';

// Define un tipo de Usuario más simple para el estado de nuestra aplicación
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
  _setUser: (user: User | null) => void;
  _setLoading: (loading: boolean) => void;
}

// Creamos una única instancia del cliente para usarla en todo el store
const supabaseClient = createClient();

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    loading: true, 
    supabase: supabaseClient,
    _setUser: (user) => set({ user }),
    _setLoading: (loading) => set({ loading }),
    login: async (email, password) => {
        const supabase = get().supabase;
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // El estado del usuario será actualizado por onAuthStateChange
        return data;
    },
    register: async (email, password, displayName) => {
        const supabase = get().supabase;
        const { data, error } = await supabase.auth.signUp({
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
        const supabase = get().supabase;
        await supabase.auth.signOut();
        set({ user: null });
        useWalletStore.getState().reset();
    },
}));

const AuthContext = createContext<Omit<AuthState, '_setUser' | '_setLoading'> | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const store = useAuthStore();

    useEffect(() => {
        store._setLoading(true);
        const { data: { subscription } } = store.supabase.auth.onAuthStateChange(
            async (event, session) => {
                const currentUser = session?.user;

                if (!currentUser) {
                    store._setUser(null);
                    store._setLoading(false);
                    return;
                }

                // Para cualquier evento con sesión (SIGNED_IN, INITIAL_SESSION), cargamos los datos
                if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
                     try {
                        const { data: profile, error: profileError } = await store.supabase
                            .rpc('get_user_profile')
                            .single();
                        
                        if (profileError) throw profileError;

                        const simplifiedUser: User = {
                            id: currentUser.id,
                            email: currentUser.email,
                            displayName: profile?.display_name || 'Nuevo Usuario',
                            role: profile?.role || 'user'
                        };
                        
                        store._setUser(simplifiedUser);

                     } catch (error) {
                        console.error("Error crítico al obtener perfil, cerrando sesión:", error);
                        store._setUser(null);
                        await store.supabase.auth.signOut();
                     }
                }
                 store._setLoading(false);
            }
        );

        return () => {
            subscription?.unsubscribe();
        };
    }, [store]);

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
  return context;
};
