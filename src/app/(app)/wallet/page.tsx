'use client';

import CoinCard from "@/components/wallet/coin-card";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import RechargeDialog from "@/components/wallet/recharge-dialog";
import { useWallet } from "@/hooks/use-wallet";
import { VTC_SYMBOL } from '@/lib/constants';

export default function WalletPage() {
    const { balance } = useWallet();

    const vtcCoin = {
        id: 'viltrum-coin',
        name: 'Viltrum Coin',
        symbol: VTC_SYMBOL,
        amount: balance,
        usdValue: balance, // Placeholder
        iconUrl: '/viltrum-logo-2.png'
    }

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-6 flex flex-col h-full">
            <header>
                 <h1 
                    className="text-4xl font-bold font-headline text-glow"
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
                        <CarouselItem className="pl-1 basis-full">
                            <CoinCard coin={vtcCoin} />
                        </CarouselItem>
                    </CarouselContent>
                </Carousel>

                <RechargeDialog />
            </div>
        </div>
    )
}
