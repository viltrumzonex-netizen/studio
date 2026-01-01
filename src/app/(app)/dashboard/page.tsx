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
                                            <div className={"flex items-center justify-center w-12 h-12"}>
                                                {isTopUp ? <PlusCircle className={cn("w-8 h-8", iconColor)} /> : <Image src={tx.coin.iconUrl} alt={tx.coin.name} width={40} height={40} /> }
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
                                                ~{(tx.amount * useSettings().exchangeRate).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} VES
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
