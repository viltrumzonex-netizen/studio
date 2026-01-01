'use client';

import { Card, CardContent } from "@/components/ui/card";
import { walletCoins } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownLeft, PlusCircle } from "lucide-react";
import Link from 'next/link';
import AnimatedBalance from "@/components/dashboard/animated-balance";
import Image from "next/image";

// Find the Viltrum Coin from the wallet to display its balance
const viltrumCoin = walletCoins.find(c => c.symbol === 'VTC');
const vtcBalance = viltrumCoin ? viltrumCoin.amount : 0;
const vtcIconUrl = viltrumCoin ? viltrumCoin.iconUrl : '';

export default function BalanceCard() {
    const usdValue = vtcBalance; // Assuming 1 VTC = 1 USD for this mock

    return (
        <Card className="glass-card rounded-xl overflow-hidden relative border-primary/20 neon-glow-primary">
             <div className="absolute top-0 right-0 h-full w-2/5 bg-gradient-to-l from-primary/30 to-transparent pointer-events-none"></div>
             <Image 
                src="/viltrum-logo-2.png" 
                alt="Viltrum Pattern" 
                width={200}
                height={200}
                className="absolute -right-12 -top-4 opacity-5 pointer-events-none rotate-12"
             />

            <CardContent className="p-6 space-y-4 relative z-10">
                <div className="flex justify-between items-center">
                    <p className="text-muted-foreground flex items-center gap-2">
                        <Image src={vtcIconUrl} alt="Viltrum Coin" width={24} height={24}/>
                        Balance en VTC
                    </p>
                </div>
                
                <div>
                    <AnimatedBalance value={vtcBalance} />
                    <p className="text-muted-foreground -mt-1">${usdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</p>
                </div>
                
                <div className="grid grid-cols-3 gap-2 pt-4">
                    <Button asChild variant="outline" className="flex-col h-auto py-2 bg-transparent border-primary/30 hover:bg-primary/10">
                        <Link href="/transactions">
                            <PlusCircle className="h-5 w-5"/>
                            <span className="text-xs mt-1">Recargar</span>
                        </Link>
                    </Button>
                    <Button asChild variant="outline" className="flex-col h-auto py-2 bg-transparent border-primary/30 hover:bg-primary/10">
                        <Link href="/transactions">
                            <ArrowUpRight className="h-5 w-5"/>
                            <span className="text-xs mt-1">Enviar</span>
                        </Link>
                    </Button>
                    <Button asChild variant="outline" className="flex-col h-auto py-2 bg-transparent border-primary/30 hover:bg-primary/10">
                        <Link href="/transactions">
                            <ArrowDownLeft className="h-5 w-5"/>
                            <span className="text-xs mt-1">Recibir</span>
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
