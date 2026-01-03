
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import AuthForm from '@/components/auth/auth-form';
import Image from 'next/image';

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If auth is no longer loading and we have a user, redirect to the dashboard.
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);


  // While auth is loading, or if we have a user and are about to redirect, show a loader.
  if (loading || user) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
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
                <p className="text-muted-foreground tracking-widest animate-pulse">ESTABLECIENDO CONEXIÓN...</p>
            </div>
        </div>
    );
  }
  
  // If not loading and no user, show the login form.
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-background overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
            <div 
                className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"
            ></div>
             <div 
                className="absolute inset-0 bg-grid-pattern"
            ></div>
        </div>
        <div className="absolute inset-0 z-0">
            <div className="absolute -top-48 -left-48 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-slow"></div>
            <div className="absolute -bottom-48 -right-48 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse-slow animation-delay-4000"></div>
        </div>

      <div className="z-10 w-full max-w-md animate-fade-in-up">
        <div className="text-center mb-8">
            <Image src="/viltrum-logo-2.png" alt="Viltrum Wallet Logo" width={80} height={80} className="mx-auto mb-4"/>
            <h1 className="text-4xl font-bold font-headline text-glow">Viltrum Wallet</h1>
        </div>
        <AuthForm />
      </div>
    </main>
  );
}
