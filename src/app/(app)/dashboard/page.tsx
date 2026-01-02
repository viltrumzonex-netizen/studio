'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Package, PackageCheck, PackageX, ShoppingBag } from "lucide-react";
import { format } from 'date-fns';
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import Image from "next/image";
import { useSettings } from "@/hooks/use-settings";
import BalanceCard from "@/components/dashboard/balance-card";
import { Progress } from "@/components/ui/progress";
import { TOTAL_SUPPLY } from "@/lib/mock-data";
import { useWallet } from "@/hooks/use-wallet";

export default function DashboardPage() {
    const { user } = useAuth();
    const { titleSize } = useSettings();
    const { transactions, circulatingSupply } = useWallet();
    const circulationPercentage = (circulatingSupply / TOTAL_SUPPLY) * 100;
    
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

            <Card className="glass-card">
                <CardHeader>
                    <CardTitle>Economía de Viltrum Coin</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <div className="flex justify-between items-baseline">
                            <p className="text-muted-foreground">VTC en Circulación</p>
                            <p className="font-bold font-headline text-lg">{circulatingSupply} <span className="text-sm text-muted-foreground">/ {TOTAL_SUPPLY} VTC</span></p>
                        </div>
                        <Progress value={circulationPercentage} className="h-2" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                        <div>
                            <div className="flex items-center justify-center gap-2">
                                <Package className="h-5 w-5 text-muted-foreground"/>
                                <h3 className="text-md font-semibold">Suministro Total</h3>
                            </div>
                            <p className="text-2xl font-bold font-headline text-glow">{TOTAL_SUPPLY}</p>
                        </div>
                        <div>
                           <div className="flex items-center justify-center gap-2">
                                <PackageCheck className="h-5 w-5 text-muted-foreground"/>
                                <h3 className="text-md font-semibold">En Circulación</h3>
                            </div>
                            <p className="text-2xl font-bold font-headline text-primary">{circulatingSupply}</p>
                        </div>
                        <div>
                           <div className="flex items-center justify-center gap-2">
                                <PackageX className="h-5 w-5 text-muted-foreground"/>
                                <h3 className="text-md font-semibold">Restantes</h3>
                            </div>
                            <p className="text-2xl font-bold font-headline text-accent">{TOTAL_SUPPLY - circulatingSupply}</p>
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
                            {transactions.slice(0, 3).map(tx => {
                                const isSent = tx.type === 'sent';
                                const isTopUp = tx.type === 'top-up';
                                const isStorePurchase = tx.type === 'expense';
                                const iconColor = isSent || isStorePurchase ? "text-accent" : "text-primary";
                                const sign = isSent || isStorePurchase ? '-' : '+';
                                
                                let title = '';
                                if (isTopUp) {
                                    title = `Recarga de ${tx.from}`;
                                } else if (isSent) {
                                    title = `Enviado ${tx.coin.symbol}`;
                                } else if(isStorePurchase) {
                                    title = `Canje: ${tx.details}`;
                                } else {
                                    title = `Recibido ${tx.coin.symbol}`;
                                }

                                return (
                                    <li key={tx.id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={"flex items-center justify-center w-12 h-12"}>
                                                {isTopUp && <PlusCircle className={cn("w-8 h-8", iconColor)} />}
                                                {(isSent || isStorePurchase) && <ShoppingBag className={cn("w-8 h-8", iconColor)} />}
                                                {tx.type === 'received' && <Image src={tx.coin.iconUrl} alt={tx.coin.name} width={40} height={40} /> }
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
