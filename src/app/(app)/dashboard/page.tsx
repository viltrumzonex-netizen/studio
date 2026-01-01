'use client';

import { transactions } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import { format } from 'date-fns';
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import Image from "next/image";
import { useSettings } from "@/hooks/use-settings";
import BalanceCard from "@/components/dashboard/balance-card";

export default function DashboardPage() {
    const { user } = useAuth();
    const { titleSize } = useSettings();
    
    return (
        <div className="container mx-auto p-4 md:p-8 space-y-8">
            <header>
                {user && <p className="text-lg text-muted-foreground">Bienvenido de nuevo, {user.displayName}</p>}
                <h1 
                    className="font-bold font-headline text-glow mt-1"
                    style={{ fontSize: `${titleSize}px` }}
                >
                    Panel Principal
                </h1>
            </header>

            <BalanceCard />

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
                                                {isTopUp ? <PlusCircle className={cn("w-5 h-5", iconColor)} /> : <Image src={tx.coin.iconUrl} alt={tx.coin.name} width={20} height={20} /> }
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
        </div>
    )
}
