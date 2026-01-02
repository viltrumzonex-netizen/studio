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
  const router = useRouter();

  // Check user session on initial load and listen for storage changes
  useEffect(() => {
    const checkUserSession = () => {
      setLoading(true);
      try {
        const storedUser = localStorage.getItem('viltrum_user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          setUser(null);
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
    
    // Listen for changes in other tabs
    const handleStorageChange = (event: StorageEvent) => {
        if (event.key === 'viltrum_user') {
            checkUserSession();
        }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };

  }, []);

  const handleAuthSuccess = (userData: User) => {
      setUser(userData);
      localStorage.setItem('viltrum_user', JSON.stringify(userData));
      document.cookie = `viltrum_user=${encodeURIComponent(JSON.stringify(userData))}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days
      router.push('/dashboard'); // Use Next.js router for smooth client-side navigation
  }

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
    
    handleAuthSuccess(data.user);
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

      handleAuthSuccess(data.user);
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('viltrum_user');
    document.cookie = 'viltrum_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    router.push('/');
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
