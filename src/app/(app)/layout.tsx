'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import BottomNav from '@/components/shared/bottom-nav';
import Sidebar from '@/components/shared/sidebar';

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
         {/* A full-page loader can be placed here */}
      </div>
    );
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
