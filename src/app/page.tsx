'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import AuthForm from '@/components/auth/auth-form';
import { NeonWalletLogo } from '@/components/icons';

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading || (!loading && user)) {
    // Render a loading state while redirecting
    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
            <NeonWalletLogo className="w-24 h-24 mb-6 text-primary animate-pulse" />
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
            <div className="inline-block p-4 bg-white/10 rounded-2xl mb-4">
                <NeonWalletLogo className="w-16 h-16 text-primary" />
            </div>
            <h1 className="text-4xl font-bold font-headline text-glow">NeonWallet</h1>
            <p className="text-muted-foreground mt-2">Your gateway to the future of finance.</p>
        </div>
        <AuthForm />
      </div>
    </main>
  );
}
