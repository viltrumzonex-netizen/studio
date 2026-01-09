
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
}

// Creamos una única instancia del cliente para usarla en todo el store
const supabaseClient = createClient();

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    loading: true, 
    supabase: supabaseClient,
    login: async (email, password) => {
        const supabase = get().supabase;
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // El estado del usuario será actualizado por onAuthStateChange
        return data;
    },
    register: async (email, password, displayName) => {
        const supabase = get().supabase;

        // El registro de usuario llama a signUp. Un trigger en la base de datos
        // se encargará de crear el perfil del usuario en la tabla 'profiles'.
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    display_name: displayName,
                }
            }
        });

        if (signUpError) {
            console.error("Error durante el signUp:", signUpError);
            throw signUpError;
        }

        if (!authData.user) {
            throw new Error("El registro no devolvió un usuario. Por favor, intenta iniciar sesión.");
        }
        
        // Si el registro es exitoso, el trigger se encarga de crear el perfil.
        // onAuthStateChange se encargará de actualizar el estado de la aplicación.
        return authData;
    },
    logout: async () => {
        const supabase = get().supabase;
        await supabase.auth.signOut();
    },
}));

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const supabase = useAuthStore((state) => state.supabase);

    const handleAuthStateChange = useCallback(async (event: AuthChangeEvent, session: Session | null) => {
        const currentUser = session?.user;

        // Si hay una sesión (ya sea por inicio de sesión o sesión inicial), obtenemos el perfil.
        if (currentUser) {
            // Establecer estado de carga para el perfil
            useAuthStore.setState({ loading: true });

            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('role, display_name')
                .eq('id', currentUser.id)
                .single();

            if (profileError) {
                console.error("Error al obtener el perfil:", profileError);
                useAuthStore.setState({ user: null, loading: false });
                await supabase.auth.signOut(); // Forzar cierre de sesión si el perfil no se puede cargar
                return;
            }

            const simplifiedUser: User = {
                id: currentUser.id,
                email: currentUser.email,
                displayName: profile?.display_name || 'Nuevo Usuario',
                role: profile?.role || 'user'
            };

            useAuthStore.setState({ user: simplifiedUser, loading: false });
            
            // Iniciar la carga de datos de la billetera solo después de tener el perfil
            useWalletStore.getState().fetchWalletData();

        } else if (event === 'SIGNED_OUT' || !currentUser) {
            // Si el usuario cierra sesión o no hay usuario en la sesión inicial
            useAuthStore.setState({ user: null, loading: false });
            useWalletStore.getState().reset();
        }
    }, [supabase]);

    useEffect(() => {
        // Al montar el componente, establecemos el estado de carga inicial
        useAuthStore.setState({ loading: true });
        const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

        return () => {
            subscription?.unsubscribe();
        };
    }, [supabase, handleAuthStateChange]);


    return (
        <AuthContext.Provider value={useAuthStore(state => state)}>
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
