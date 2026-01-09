
'use client';

import { createContext, useContext, type ReactNode, useEffect } from 'react';
import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import type { SupabaseClient, Session } from '@supabase/supabase-js';
import { useWalletStore } from './use-wallet';

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
        // onAuthStateChange se encargará de actualizar el estado
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
        // El trigger de la DB creará el perfil, y onAuthStateChange se encargará del resto
        return data;
    },
    logout: async () => {
        await get().supabase.auth.signOut();
        // onAuthStateChange se encargará de limpiar el estado
    },
}));

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const store = useAuthStore();

    useEffect(() => {
        const handleAuthStateChange = async (event: string, session: Session | null) => {
            if (event === 'SIGNED_OUT' || !session) {
                useAuthStore.setState({ user: null, loading: false });
                // La limpieza de la billetera es manejada por su propio hook
                return;
            }
            
            if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
                useAuthStore.setState({ loading: true });
                try {
                    // Consulta directa al perfil del usuario, forzando un único resultado
                    // con .limit(1) como salvaguarda contra el error 'Cannot coerce...'.
                    const { data: profile, error: profileError } = await supabaseClient
                        .from('profiles')
                        .select('role, display_name')
                        .eq('id', session.user.id)
                        .limit(1) // Salvaguarda crucial
                        .single();

                    if (profileError) {
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
        };

        const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(handleAuthStateChange);

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
