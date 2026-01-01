'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import AuthForm from '@/components/auth/auth-form';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { ViltrumCoin } from '@/components/icons';

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
            <div className="w-full max-w-md space-y-6">
                <div className="flex justify-center">
                    <ViltrumCoin className="w-24 h-24 text-primary animate-pulse" />
                </div>
                <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-12 w-full mt-4" />
                </div>
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
            <div className="inline-block bg-white/10 rounded-2xl mb-4">
                <Image src="https://storage.googleapis.com/monite-api-public-images/viltrum-logo.png" alt="Viltrum Wallet Logo" width={80} height={80} className="p-2"/>
            </div>
            <h1 className="text-4xl font-bold font-headline text-glow">Viltrum Wallet</h1>
            <p className="text-muted-foreground mt-2">Tu portal al futuro de las finanzas.</p>
        </div>
        <AuthForm />
      </div>
    </main>
  );
}
