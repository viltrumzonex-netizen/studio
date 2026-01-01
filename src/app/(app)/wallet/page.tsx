'use client';

import { walletCoins } from "@/lib/mock-data";
import CoinCard from "@/components/wallet/coin-card";
import { useSettings } from "@/hooks/use-settings";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";

export default function WalletPage() {
    const { titleSize } = useSettings();

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-6 flex flex-col h-full">
            <header>
                 <h1 
                    className="font-bold font-headline text-glow"
                    style={{ fontSize: `${titleSize}px` }}
                >
                    Mi Billetera
                </h1>
                <p className="text-muted-foreground mt-1">Un resumen de tus criptoactivos.</p>
            </header>
            
            <div className="flex-1 flex items-center justify-center">
                 <Carousel
                    opts={{
                        align: "start",
                    }}
                    className="w-full max-w-sm"
                    >
                    <CarouselContent>
                        {walletCoins.map((coin) => (
                        <CarouselItem key={coin.id}>
                            <CoinCard coin={coin} />
                        </CarouselItem>
                        ))}
                    </CarouselContent>
                </Carousel>
            </div>
        </div>
    )
}
