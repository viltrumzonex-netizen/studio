'use client';

import CoinCard from "@/components/wallet/coin-card";
import { useSettings } from "@/hooks/use-settings";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import RechargeDialog from "@/components/wallet/recharge-dialog";
import { useWallet } from "@/hooks/use-wallet";

export default function WalletPage() {
    const { titleSize } = useSettings();
    const { walletCoins } = useWallet();

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-6 flex flex-col h-full">
            <header>
                 <h1 
                    className="font-bold font-headline text-glow"
                    style={{ fontSize: `${titleSize}px` }}
                >
                    Mi Billetera
                </h1>
                <p className="text-muted-foreground mt-1">Un resumen de tus coins.</p>
            </header>
            
            <div className="flex-1 flex flex-col items-center justify-center gap-8">
                 <Carousel
                    opts={{
                        align: "start",
                    }}
                    className="w-full max-w-md"
                    >
                    <CarouselContent>
                        {walletCoins.map((coin) => (
                        <CarouselItem key={coin.id} className="pl-1 basis-full">
                            <CoinCard coin={coin} />
                        </CarouselItem>
                        ))}
                    </CarouselContent>
                </Carousel>

                <RechargeDialog />
            </div>
        </div>
    )
}
