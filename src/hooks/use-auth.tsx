'use client';

import { createContext, useContext, useState, type ReactNode, useEffect } from 'react';
import { Skeleton } from "@/components/ui/skeleton";

// Mock user for demo purposes
const MOCK_USER = {
  uid: 'demo-user-id-12345',
  email: 'user@example.com',
  displayName: 'Demo User',
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
    // In a real app, you might check a token from localStorage here
    // For demo, we'll just stop loading.
    setLoading(false);
  }, []);


  const login = async (email?: string, password?: string) => {
    setLoading(true);
    // In a real app, you would make an API call to your backend here
    // await api.post('/login', { email, password });
    // For demo purposes, we'll just simulate a successful login.
    await new Promise(resolve => setTimeout(resolve, 500));
    setUser(MOCK_USER);
    setLoading(false);
  };

  const logout = async () => {
    setLoading(true);
     // In a real app, you would make an API call to your backend here
    // await api.post('/logout');
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
