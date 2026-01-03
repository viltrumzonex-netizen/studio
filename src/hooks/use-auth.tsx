'use client';

import { createContext, useContext, useState, type ReactNode, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

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
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchSession = useCallback(async () => {
    setLoading(true);
    try {
        const response = await fetch('/api/auth/session');
        if (response.ok) {
            const data = await response.json();
            setUser(data.user);
        } else {
            setUser(null);
        }
    } catch (e) {
        console.error("Failed to fetch session", e);
        setUser(null);
    } finally {
        setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Error al iniciar sesión.');
    }
    
    // The API now returns the user object on success.
    // Set the user directly to avoid race conditions with cookies.
    setUser(data.user);
  };
  
  const register = async (email: string, password: string, displayName: string) => {
      const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, displayName }),
      });

      const data = await response.json();
      if (!response.ok) {
          throw new Error(data.message || 'Error al registrar el usuario.');
      }
      
      // The API now returns the user object on success.
      // Set the user directly.
      setUser(data.user);
  };

  const logout = async () => {
    try {
        await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
        console.error("Failed to call logout API", error);
    } finally {
        setUser(null);
        // Force reload to clear all state and ensure clean redirect.
        window.location.href = '/';
    }
  };

  const value = { user, loading, login, register, logout, refreshUser: fetchSession };

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
