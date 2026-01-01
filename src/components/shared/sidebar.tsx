'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import {
  LayoutDashboard,
  Wallet,
  ArrowRightLeft,
  BrainCircuit,
  LogOut,
  Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NeonWalletLogo } from '@/components/icons';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/wallet', label: 'Wallet', icon: Wallet },
  { href: '/transactions', label: 'Activity', icon: ArrowRightLeft },
  { href: '/ai-analysis', label: 'AI Analysis', icon: BrainCircuit },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { toast } = useToast();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast({ title: 'Signed Out', description: 'You have been successfully signed out.' });
      router.push('/');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error Signing Out', description: error.message });
    }
  };

  return (
    <aside className="hidden md:flex flex-col w-64 bg-background border-r border-white/10 p-4 space-y-8">
      <div className="flex items-center gap-2 px-2">
        <NeonWalletLogo className="w-8 h-8 text-primary" />
        <h1 className="text-xl font-bold font-headline text-glow">NeonWallet</h1>
      </div>
      
      <nav className="flex-1">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-muted-foreground hover:bg-primary/10 hover:text-primary',
                    isActive && 'bg-primary/20 text-primary font-semibold'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div>
        <ul className="space-y-2">
           <li>
                <Link
                  href="#"
                  className='flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-muted-foreground hover:bg-primary/10 hover:text-primary'
                >
                  <Settings className="w-5 h-5" />
                  <span>Settings</span>
                </Link>
              </li>
           <li>
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="w-full justify-start gap-3 px-3 py-2 text-muted-foreground hover:bg-destructive/20 hover:text-destructive"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </Button>
          </li>
        </ul>
      </div>
    </aside>
  );
}
