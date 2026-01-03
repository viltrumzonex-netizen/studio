
'use client';

import { type ReactNode, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import BottomNav from '@/components/shared/bottom-nav';
import Sidebar from '@/components/shared/sidebar';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If authentication is finished and there is DEFINITELY no user, redirect to login.
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [authLoading, user, router]);

  // If authentication is loading, or if there's no user yet (and we're about to redirect),
  // show a consistent, full-screen loading state.
  // This prevents rendering children that might depend on the user object.
  if (authLoading || !user) {
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

  // If auth is done and we have a user, render the full app layout.
  // The 'user' object is now guaranteed to be available in all children.
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
