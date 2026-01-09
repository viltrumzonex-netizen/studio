'use client';

import { createContext, useContext, type ReactNode, useEffect } from 'react';
import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';

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
}

// Creamos una única instancia del cliente para usarla en todo el store
const supabaseClient = createClient();

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    loading: true, 
    supabase: supabaseClient,
    login: async (email, password) => {
        const { data, error } = await get().supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // El estado se actualizará a través de onAuthStateChange
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
        // El perfil se crea mediante un trigger en la DB
        return data;
    },
    logout: async () => {
        await get().supabase.auth.signOut();
        // El estado se limpiará a través de onAuthStateChange
    },
}));

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const store = useAuthStore();

    useEffect(() => {
        useAuthStore.setState({ loading: true });

        const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
            async (event, session) => {
                // Evento de cierre de sesión o sesión expirada
                if (event === 'SIGNED_OUT' || !session) {
                    useAuthStore.setState({ user: null, loading: false });
                    return;
                }
                
                // Evento de inicio de sesión o sesión ya existente
                if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
                    try {
                        const { data: profile, error: profileError } = await supabaseClient
                            .rpc('get_user_profile')
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
            }
        );

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
  return context;
};
