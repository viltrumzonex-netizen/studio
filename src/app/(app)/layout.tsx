'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import BottomNav from '@/components/shared/bottom-nav';
import Sidebar from '@/components/shared/sidebar';
import Image from 'next/image';

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If auth is done loading and there's no user, redirect to login.
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  // Show a loader while authentication is in progress.
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
         <div className="w-full max-w-md space-y-6 flex flex-col items-center">
             <div className="relative flex items-center justify-center">
                <div className="absolute h-32 w-32 bg-primary/30 rounded-full blur-2xl animate-pulse"></div>
                <Image 
                    src="/viltrum-logo-2.png" 
                    alt="Viltrum Wallet Logo" 
                    width={96} 
                    height={96} 
                    className="relative z-10" 
                    priority 
                />
            </div>
            <p className="text-muted-foreground animate-pulse">Cargando...</p>
        </div>
      </div>
    );
  }

  // If there's a user, render the app layout.
  // If there's no user, this will be briefly rendered before the useEffect redirects.
  // Rendering null or a minimal loader here can prevent a flash of the layout.
  if (!user) {
    return null; 
  }

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
