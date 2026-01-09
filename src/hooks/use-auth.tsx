
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
        // El perfil se crea mediante un trigger en la DB, onAuthStateChange se encargará del resto.
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
        const handleAuthStateChange = async (event: string, session: Session | null) => {
            if (event === 'SIGNED_OUT' || !session) {
                useAuthStore.setState({ user: null, loading: false });
                useWalletStore.getState().reset();
                return;
            }
            
            // Este evento se dispara tanto en el login/registro como al cargar la página con una sesión existente.
            if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
                // Solo intentar obtener el perfil si no tenemos ya un usuario.
                // Esto previene bucles si múltiples eventos se disparan rápido.
                if (useAuthStore.getState().user?.id === session.user.id) {
                    return;
                }

                useAuthStore.setState({ loading: true });
                try {
                    // Consulta directa al perfil del usuario.
                    // Con RLS, esto solo debe devolver la fila del usuario autenticado.
                    const { data: profile, error: profileError } = await supabaseClient
                        .from('profiles')
                        .select('role, display_name')
                        .eq('id', session.user.id)
                        .single();

                    if (profileError) {
                        // Lanzar el error para que sea capturado por el bloque catch.
                        throw new Error(`No se pudo obtener el perfil: ${profileError.message}`);
                    }
                    
                    const simplifiedUser: User = {
                        id: session.user.id,
                        email: session.user.email,
                        displayName: profile.display_name || 'Nuevo Usuario',
                        role: profile.role || 'user'
                    };
                    
                    useAuthStore.setState({ user: simplifiedUser, loading: false });
                    // La carga de la billetera es manejada por el hook useWallet,
                    // que se suscribe a los cambios de useAuthStore.

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
  
  // Devuelve directamente el estado del store de Zustand.
  // Esto asegura que cualquier componente que use este hook se re-renderice
  // cuando cambie el estado de autenticación.
  return useAuthStore();
};
