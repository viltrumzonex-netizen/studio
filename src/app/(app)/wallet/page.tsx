'use client';

import { useState, useEffect } from "react";
import { walletCoins } from "@/lib/mock-data";
import CoinCard from "@/components/wallet/coin-card";
import SizeAdjuster from "@/components/wallet/size-adjuster";

const INITIAL_ICON_SIZE = 100;

export default function WalletPage() {
    const [iconSize, setIconSize] = useState(INITIAL_ICON_SIZE);
    const [isAdjusterOpen, setIsAdjusterOpen] = useState(false);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.altKey && event.key.toLowerCase() === 's') {
                event.preventDefault();
                setIsAdjusterOpen(prev => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);


    return (
        <div className="container mx-auto p-4 md:p-8 space-y-6">
            <header>
                <h1 className="text-4xl font-bold font-headline text-glow">Mi Billetera</h1>
                <p className="text-muted-foreground mt-1">Un resumen de tus criptoactivos.</p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {walletCoins.map(coin => (
                    <CoinCard key={coin.id} coin={coin} iconSize={iconSize} />
                ))}
            </div>

            <SizeAdjuster 
                isOpen={isAdjusterOpen}
                setIsOpen={setIsAdjusterOpen}
                size={iconSize}
                setSize={setIconSize}
            />
             <div className="fixed bottom-4 right-4 z-50">
                <p className="text-xs text-muted-foreground/50 bg-background/50 backdrop-blur-sm p-2 rounded-md">Atajo: Alt + S</p>
            </div>
        </div>
    )
}
