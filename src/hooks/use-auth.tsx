
'use client';

import { createContext, useContext, type ReactNode, useEffect } from 'react';
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

        // Paso 1: Registrar al usuario en Supabase Auth
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
        });

        if (signUpError) {
            console.error("Error durante el signUp:", signUpError);
            throw signUpError;
        }

        if (!authData.user) {
            throw new Error("El registro tuvo éxito pero no se devolvió ningún usuario. Por favor, intenta iniciar sesión.");
        }

        // Paso 2: Insertar manualmente el perfil en la tabla public.profiles.
        // La política RLS "Users can insert their own profile." permite esta operación.
        const { error: profileError } = await supabase
            .from('profiles')
            .insert({ 
                id: authData.user.id, 
                display_name: displayName,
                role: 'user' 
            });

        if (profileError) {
            console.error("Error al crear el perfil después del registro:", profileError);
            // Opcional: Podrías querer eliminar el usuario de auth si la creación del perfil falla.
            // await supabase.auth.admin.deleteUser(authData.user.id);
            throw new Error(`Usuario registrado, pero falló la creación del perfil: ${profileError.message}`);
        }
        
        // Si todo sale bien, la sesión se actualizará y onAuthStateChange se encargará del resto.
        return authData;
    },
    logout: async () => {
        const supabase = get().supabase;
        await supabase.auth.signOut();
    },
}));

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    // Usamos la instancia única del cliente desde el store
    const supabase = useAuthStore((state) => state.supabase);

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event: AuthChangeEvent, session: Session | null) => {
                const currentUser = session?.user;
                if (currentUser) {
                    // Obtener perfil para obtener el rol y el nombre de usuario
                    const { data: profile, error: profileError } = await supabase
                        .from('profiles')
                        .select('role, display_name')
                        .eq('id', currentUser.id)
                        .single();
                    
                    if (profileError && profileError.code !== 'PGRST116') { // PGRST116: no rows found
                         console.error("Error al obtener el perfil:", profileError);
                         useAuthStore.setState({ user: null, loading: false });
                         return;
                    }

                    const simplifiedUser: User = {
                        id: currentUser.id,
                        email: currentUser.email,
                        displayName: profile?.display_name || 'Nuevo Usuario',
                        role: profile?.role || 'user'
                    };
                    useAuthStore.setState({ user: simplifiedUser, loading: false });
                    
                    // Iniciar la carga de datos de la billetera
                    useWalletStore.getState().fetchWalletData();

                } else {
                    // Si no hay sesión, limpiar el estado
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
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};
