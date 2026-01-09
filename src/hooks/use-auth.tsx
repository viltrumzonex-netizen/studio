
'use client';

import { createContext, useContext, type ReactNode, useEffect } from 'react';
import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';
import { useWalletStore } from './use-wallet';

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
        const handleAuthStateChange = async (event: string, session: any) => {
            // Evento de cierre de sesión o sesión expirada
            if (event === 'SIGNED_OUT' || !session) {
                useAuthStore.setState({ user: null, loading: false });
                useWalletStore.getState().reset();
                return;
            }
            
            // Evento de inicio de sesión o sesión ya existente
            if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'USER_UPDATED') {
                useAuthStore.setState({ loading: true });
                try {
                    // Consulta directa a la tabla profiles
                    const { data: profile, error: profileError } = await supabaseClient
                        .from('profiles')
                        .select('role, display_name')
                        .eq('id', session.user.id)
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
                    // Una vez que el usuario está, llamamos a la carga de la billetera
                    useWalletStore.getState().fetchWalletData(simplifiedUser);

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
  return context;
};
