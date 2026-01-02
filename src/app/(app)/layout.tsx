'use client';

import { type ReactNode } from 'react';
import { useAuth } from '@/hooks/use-auth';
import BottomNav from '@/components/shared/bottom-nav';
import Sidebar from '@/components/shared/sidebar';
import Image from 'next/image';

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  
  // The middleware now handles redirection. We just need to show a loading
  // state until the auth status is confirmed from the client side.
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
         <div className="w-full max-w-md space-y-6 flex flex-col items-center">
             <div className="relative flex items-center justify-center h-48 w-48">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute inset-0 border-2 border-primary/30 rounded-full animate-spin-slow"></div>
                <div className="absolute inset-4 border-t-2 border-primary/50 rounded-full animate-spin-slow-reverse"></div>
                <Image 
                    src="/viltrum-logo-2.png" 
                    alt="Viltrum Wallet Logo" 
                    width={96} 
                    height={96} 
                    className="relative z-10 animate-pulse-soft" 
                    priority 
                />
            </div>
            <p className="text-muted-foreground tracking-widest animate-pulse">CARGANDO DATOS...</p>
        </div>
      </div>
    );
  }

  // If loading is finished and there is still no user, middleware will redirect.
  // If there is a user, render the app layout.
  if (user) {
    return (
      <div className="flex min-h-screen bg-background">
          <Sidebar />
          <div className="flex-1 flex flex-col">
              <main className="flex-1 md:pb-0 pb-20 overflow-y-auto">
                  {children}
              </main>
              <BottomNav />
          </div>
      </div>
    );
  }

  // If loading is finished and there's no user, we can return null or a loader
  // as middleware will handle redirection. A loader is safer to prevent flashes.
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <p className="text-muted-foreground tracking-widest">Redirigiendo...</p>
    </div>
  );
}
