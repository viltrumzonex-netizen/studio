'use client';

import { createContext, useContext, useState, type ReactNode, useEffect, useCallback } from 'react';

export type User = {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'user';
};

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This function runs once on mount to check for an existing session.
    const checkUserSession = () => {
        setLoading(true);
        try {
            const storedUser = localStorage.getItem('viltrum_user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch (e) {
            console.error("Failed to parse user from localStorage", e);
            // Clear corrupted data
            localStorage.removeItem('viltrum_user');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };
    
    checkUserSession();
  }, []);


  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al iniciar sesión.');
      }
      
      setUser(data.user);
      localStorage.setItem('viltrum_user', JSON.stringify(data.user));

    } catch (error: any) {
      // Re-throw the error so the form can catch it and display a toast
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const register = async (email: string, password: string, displayName: string) => {
    setLoading(true);
    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, displayName }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Error al registrar el usuario.');
        }

        setUser(data.user);
        localStorage.setItem('viltrum_user', JSON.stringify(data.user));

    } catch (error: any) {
        // Re-throw the error so the form can catch it and display a toast
        throw error;
    } finally {
        setLoading(false);
    }
  };


  const logout = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 100)); // Short delay
    setUser(null);
    localStorage.removeItem('viltrum_user');
    setLoading(false);
  };


  const value = { user, loading, login, register, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
