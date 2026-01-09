
'use client';

import { createContext, useContext, type ReactNode, useEffect } from 'react';
import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';
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
                useWalletStore.getState().reset(); // Limpiar datos de la billetera al cerrar sesión
                return;
            }
            
            // Para SIGNED_IN y INITIAL_SESSION
            if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
                useAuthStore.setState({ loading: true });
                try {
                    // Consulta directa al perfil del usuario.
                    const { data: profile, error: profileError } = await supabaseClient
                        .from('profiles')
                        .select('*') // Usar '*' es a veces más robusto con RLS.
                        .eq('id', session.user.id)
                        .single();

                    if (profileError) {
                        // Este error es el que hemos estado viendo. Si ocurre, la sesión se cerrará.
                        throw new Error(`No se pudo obtener el perfil: ${profileError.message}`);
                    }
                    
                    if (profile) {
                        const simplifiedUser: User = {
                            id: session.user.id,
                            email: session.user.email,
                            displayName: profile.display_name || 'Nuevo Usuario',
                            role: profile.role || 'user'
                        };
                        useAuthStore.setState({ user: simplifiedUser, loading: false });
                    } else {
                        // Caso improbable: el usuario de auth existe pero no el perfil.
                        throw new Error("El perfil del usuario no existe en la base de datos.");
                    }

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
