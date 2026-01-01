'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Wallet, ArrowRightLeft, BrainCircuit } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/wallet', label: 'Wallet', icon: Wallet },
  { href: '/transactions', label: 'Activity', icon: ArrowRightLeft },
  { href: '/ai-analysis', label: 'AI', icon: BrainCircuit },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-background/70 backdrop-blur-lg border-t border-white/10 md:hidden">
      <div className="flex justify-around items-center h-full max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className="flex flex-col items-center justify-center text-muted-foreground w-1/4 h-full">
              <div className={cn(
                'relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300',
                isActive && 'bg-primary/20 -translate-y-2'
              )}>
                <item.icon className={cn('w-6 h-6 transition-colors', isActive && 'text-primary')} />
                {isActive && <div className="absolute -bottom-1 w-2 h-2 rounded-full bg-primary neon-glow-primary"></div>}
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
