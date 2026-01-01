'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { totalBalance, transactions, walletCoins } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownLeft, PlusCircle } from "lucide-react";
import Link from 'next/link';
import { format } from 'date-fns';
import { cn } from "@/lib/utils";
import AnimatedBalance from "@/components/dashboard/animated-balance";
import { useAuth } from "@/hooks/use-auth";

// Find the Viltrum Coin from the wallet to display its balance
const viltrumCoin = walletCoins.find(c => c.symbol === 'VTC');
const vtcBalance = viltrumCoin ? viltrumCoin.amount : 0;

export default function DashboardPage() {
    const { user } = useAuth();
    
    return (
        <div className="container mx-auto p-4 md:p-8 space-y-8">
            <header>
                {user && <p className="text-lg text-muted-foreground">Bienvenido de nuevo, {user.displayName}</p>}
                <h1 className="text-4xl font-bold font-headline text-glow mt-1">Panel Principal</h1>
            </header>

            <Card className="glass-card rounded-xl overflow-hidden">
                <CardContent className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-muted-foreground">Balance Total</p>
                            <AnimatedBalance value={vtcBalance} />
                        </div>
                         <div className="flex items-center gap-2">
                             <img src="/viltrum-logo.svg" alt="Viltrum Coin" className="w-8 h-8"/>
                             <span className="font-bold text-lg">VTC</span>
                         </div>
                    </div>
                   
                    <div className="flex gap-4 pt-4">
                        <Button asChild size="lg" className="flex-1 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 transition-opacity">
                            <Link href="/transactions">
                                <ArrowUpRight className="mr-2 h-5 w-5"/>
                                Enviar
                            </Link>
                        </Button>
                        <Button asChild size="lg" className="flex-1 bg-white/10 border border-white/20 hover:bg-white/20">
                            <Link href="/transactions">
                                <ArrowDownLeft className="mr-2 h-5 w-5"/>
                                Recibir
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <section>
                 <Card className="glass-card rounded-lg">
                    <CardHeader>
                        <CardTitle>Actividad Reciente</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-4">
                            {transactions.slice(0, 3).map(tx => {
                                const isSent = tx.type === 'sent';
                                const isTopUp = tx.type === 'top-up';
                                const iconColor = isSent ? "text-accent" : "text-primary";
                                const iconBg = isSent ? "bg-accent/20" : "bg-primary/20";
                                const sign = isSent ? '-' : '+';
                                
                                let title = '';
                                if (isTopUp) {
                                    title = `Recarga de ${tx.from}`;
                                } else if (isSent) {
                                    title = `Enviado ${tx.coin.symbol}`;
                                }
                                else {
                                    title = `Recibido ${tx.coin.symbol}`;
                                }


                                return (
                                    <li key={tx.id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={cn("flex items-center justify-center w-10 h-10 rounded-full", iconBg)}>
                                                {isTopUp ? <PlusCircle className={cn("w-5 h-5", iconColor)} /> : <tx.coin.icon className={cn("w-5 h-5", iconColor)} /> }
                                            </div>
                                            <div>
                                                <p className="font-semibold capitalize">{title}</p>
                                                <p className="text-sm text-muted-foreground">{format(tx.date, 'd MMM, yyyy')}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={cn("font-semibold", iconColor)}>
                                                {sign} {tx.amount} {tx.coin.symbol}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                ${tx.usdValue.toLocaleString('en-US')}
                                            </p>
                                        </div>
                                    </li>
                                )
                            })}
                        </ul>
                    </CardContent>
                </Card>
            </section>

            <section>
                <Card className="glass-card rounded-lg bg-gradient-to-br from-primary/10 to-accent/10">
                    <CardHeader>
                        <CardTitle className="text-glow">Análisis con IA</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">Obtén sugerencias de inversión personalizadas basadas en tu perfil.</p>
                        <Button asChild className="bg-primary hover:bg-primary/90">
                            <Link href="/ai-analysis">Analizar Mi Portafolio</Link>
                        </Button>
                    </CardContent>
                </Card>
            </section>
        </div>
    )
}
