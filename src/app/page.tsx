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
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading || (!loading && user)) {
    // Render a loading state while checking auth and redirecting
    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
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
                <p className="text-muted-foreground animate-pulse">Autenticando...</p>
            </div>
        </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-background overflow-hidden">
        <div className="absolute inset-0 z-0">
            <div className="absolute top-0 left-0 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-72 h-72 bg-accent/20 rounded-full blur-3xl animate-pulse animation-delay-4000"></div>
        </div>
      <div className="z-10 w-full max-w-md">
        <div className="text-center mb-8">
            <Image src="/viltrum-logo-2.png" alt="Viltrum Wallet Logo" width={96} height={96} className="mx-auto mb-4"/>
            <h1 className="text-4xl font-bold font-headline text-glow">Viltrum Wallet</h1>
        </div>
        <AuthForm />
      </div>
    </main>
  );
}
