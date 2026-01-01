'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Wallet,
  ArrowRightLeft,
  BrainCircuit,
  LogOut,
  Settings,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ViltrumLogo } from '@/components/icons';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

const navItems = [
  { href: '/dashboard', label: 'Panel', icon: LayoutDashboard },
  { href: '/wallet', label: 'Billetera', icon: Wallet },
  { href: '/transactions', label: 'Actividad', icon: ArrowRightLeft },
  { href: '/ai-analysis', label: 'Análisis IA', icon: BrainCircuit },
];

const adminNavItems = [
    { href: '/admin', label: 'Admin', icon: ShieldCheck },
]

export default function Sidebar() {
  const pathname = usePathname();
  const { toast } = useToast();
  const router = useRouter();
  const { logout, user } = useAuth();

  const handleSignOut = async () => {
    try {
      await logout();
      toast({ title: 'Sesión Cerrada', description: 'Has cerrado sesión exitosamente.' });
      router.push('/');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error al Cerrar Sesión', description: error.message });
    }
  };

  return (
    <aside className="hidden md:flex flex-col w-64 bg-background border-r border-white/10 p-4 space-y-8">
      <div className="flex items-center gap-2 px-2">
        <ViltrumLogo className="w-8 h-8 text-primary" />
        <h1 className="text-xl font-bold font-headline text-glow">Viltrum Zone</h1>
      </div>
      
      <nav className="flex-1">
        <p className="px-3 py-2 text-xs font-semibold text-muted-foreground/50">MENÚ</p>
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
        
        {user && (
             <div className="mt-8">
                <p className="px-3 py-2 text-xs font-semibold text-muted-foreground/50">ADMIN</p>
                 <ul className="space-y-2">
                    {adminNavItems.map((item) => {
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
            </div>
        )}

      </nav>

      <div>
        <ul className="space-y-2">
           <li>
                <Link
                  href="#"
                  className='flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-muted-foreground hover:bg-primary/10 hover:text-primary'
                >
                  <Settings className="w-5 h-5" />
                  <span>Configuración</span>
                </Link>
              </li>
           <li>
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="w-full justify-start gap-3 px-3 py-2 text-muted-foreground hover:bg-destructive/20 hover:text-destructive"
            >
              <LogOut className="w-5 h-5" />
              <span>Cerrar Sesión</span>
            </Button>
          </li>
        </ul>
      </div>
    </aside>
  );
}
