
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, PackageCheck, PackageX } from "lucide-react";
import { format } from 'date-fns';
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import Image from "next/image";
import { useWallet } from "@/hooks/use-wallet";
import BalanceCard from "@/components/dashboard/balance-card";
import { Progress } from "@/components/ui/progress";
import { TOTAL_SUPPLY } from "@/lib/constants";
import type { Transaction } from "@/lib/types";
import { transactionTypeConfig } from "@/lib/types";

export default function DashboardPage() {
    const { user } = useAuth();
    const { transactions, circulatingSupply, exchangeRate } = useWallet();
    const circulationPercentage = (Number(circulatingSupply) / TOTAL_SUPPLY) * 100;
    
    return (
        <div className="container mx-auto p-4 md:p-8 space-y-8">
            <header>
                {user && <p className="text-lg text-muted-foreground">Bienvenido de nuevo, {user.displayName}</p>}
                <h1 
                    className="text-4xl font-bold font-headline text-glow mt-1"
                >
                    Panel Principal
                </h1>
            </header>

            <BalanceCard />

            <Card className="glass-card">
                <CardHeader>
                    <CardTitle>Economía de Viltrum Coin</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <div className="flex justify-between items-baseline">
                            <p className="text-muted-foreground">VTC en Circulación</p>
                            <p className="font-bold font-headline text-lg">{Number(circulatingSupply).toLocaleString('es-VE')} <span className="text-sm text-muted-foreground">/ {TOTAL_SUPPLY.toLocaleString('es-VE')} VTC</span></p>
                        </div>
                        <Progress value={circulationPercentage} className="h-2" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                        <div>
                            <div className="flex items-center justify-center gap-2">
                                <Package className="h-5 w-5 text-muted-foreground"/>
                                <h3 className="text-md font-semibold">Suministro Total</h3>
                            </div>
                            <p className="text-2xl font-bold font-headline text-glow">{TOTAL_SUPPLY.toLocaleString('es-VE')}</p>
                        </div>
                        <div>
                           <div className="flex items-center justify-center gap-2">
                                <PackageCheck className="h-5 w-5 text-muted-foreground"/>
                                <h3 className="text-md font-semibold">En Circulación</h3>
                            </div>
                            <p className="text-2xl font-bold font-headline text-primary">{Number(circulatingSupply).toLocaleString('es-VE')}</p>
                        </div>
                        <div>
                           <div className="flex items-center justify-center gap-2">
                                <PackageX className="h-5 w-5 text-muted-foreground"/>
                                <h3 className="text-md font-semibold">Restantes</h3>
                            </div>
                            <p className="text-2xl font-bold font-headline text-accent">{(TOTAL_SUPPLY - Number(circulatingSupply)).toLocaleString('es-VE')}</p>
                        </div>
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
                            {(transactions || []).slice(0, 3).map(tx => {
                                const config = transactionTypeConfig[tx.type] || transactionTypeConfig['expense'];
                                const Icon = config.icon;
                                
                                let title = tx.description || 'Transacción';
                               
                                return (
                                    <li key={tx.id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={"flex items-center justify-center w-12 h-12"}>
                                                <Icon className={cn("w-8 h-8", config.color)} />
                                            </div>
                                            <div>
                                                <p className="font-semibold capitalize">{title}</p>
                                                <p className="text-sm text-muted-foreground">{format(new Date(tx.createdAt), 'd MMM, yyyy')}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={cn("font-semibold", config.color)}>
                                                {config.sign} {tx.amount_vtc.toLocaleString('es-VE', {minimumFractionDigits: 2, maximumFractionDigits: 2})} VTC
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                ~{(tx.amount_vtc * exchangeRate).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} VES
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
