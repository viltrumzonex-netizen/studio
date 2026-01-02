'use client';

import { createContext, useContext, useState, type ReactNode, useEffect } from 'react';

// Mock user for demo purposes
const MOCK_USER = {
  uid: 'demo-user-id-12345',
  email: 'usuario@ejemplo.com',
  displayName: 'Usuario Demo',
  role: 'admin', // admin, staff, user
};


interface AuthContextType {
  user: typeof MOCK_USER | null;
  loading: boolean;
  login: (email?: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<typeof MOCK_USER | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For demo, we'll just stop loading.
    setLoading(false);
  }, []);


  const login = async (email?: string, password?: string) => {
    setLoading(true);
    // For demo purposes, we'll just simulate a successful login.
    await new Promise(resolve => setTimeout(resolve, 1500)); // Increased delay for better loading feel
    setUser(MOCK_USER);
    setLoading(false);
  };

  const logout = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setUser(null);
    setLoading(false);
  };


  const value = { user, loading, login, logout };

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
