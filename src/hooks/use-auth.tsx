'use client';

import { createContext, useContext, useState, type ReactNode, useEffect } from 'react';

// Mock users for demo purposes
const MOCK_ADMIN_USER = {
  uid: 'admin-user-id-00001',
  email: 'admin@ejemplo.com',
  displayName: 'Admin',
  role: 'admin',
};

const MOCK_REGULAR_USER = {
  uid: 'demo-user-id-12345',
  email: 'usuario@ejemplo.com',
  displayName: 'Usuario Demo',
  role: 'user', // Explicitly 'user'
};

type MockUser = typeof MOCK_ADMIN_USER | typeof MOCK_REGULAR_USER;

interface AuthContextType {
  user: MockUser | null;
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
  const [user, setUser] = useState<MockUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);


  const login = async (email?: string, password?: string) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (email === MOCK_ADMIN_USER.email) {
      setUser(MOCK_ADMIN_USER);
    } else if (email === MOCK_REGULAR_USER.email) {
      setUser(MOCK_REGULAR_USER);
    } else {
      setLoading(false);
      throw new Error("Credenciales inválidas. Intenta con 'admin@ejemplo.com' o 'usuario@ejemplo.com'.");
    }

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