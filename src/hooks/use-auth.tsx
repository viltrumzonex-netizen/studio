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
    // This function runs once on mount to check for an existing session from localStorage.
    const checkUserSession = () => {
        setLoading(true);
        try {
            const storedUser = localStorage.getItem('viltrum_user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch (e) {
            console.error("Failed to parse user from localStorage", e);
            localStorage.removeItem('viltrum_user');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };
    
    checkUserSession();
  }, []);

  const handleAuthSuccess = (userData: User) => {
      setUser(userData);
      localStorage.setItem('viltrum_user', JSON.stringify(userData));
      // Instead of router.push here, we rely on the middleware for redirection.
      // This also helps in correctly setting the cookie for the middleware to read.
      document.cookie = `viltrum_user=${encodeURIComponent(JSON.stringify(userData))}; path=/; max-age=60*60*24*7`;
      window.location.href = '/dashboard'; // Force a full refresh to ensure middleware runs
  }


  const login = async (email: string, password: string) => {
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
      
      handleAuthSuccess(data.user);

    } catch (error: any) {
      throw error;
    }
  };
  
  const register = async (email: string, password: string, displayName: string) => {
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

        handleAuthSuccess(data.user);

    } catch (error: any) {
        throw error;
    }
  };


  const logout = async () => {
    setUser(null);
    localStorage.removeItem('viltrum_user');
    // Clear the session cookie for the middleware
    document.cookie = 'viltrum_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    window.location.href = '/'; // Force a full refresh to ensure middleware runs
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
