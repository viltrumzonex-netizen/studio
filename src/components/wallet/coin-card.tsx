import type { Coin } from "@/lib/types";
import Image from 'next/image';
import { cn } from "@/lib/utils";
import { useSettings } from "@/hooks/use-settings";

interface CoinCardProps {
    coin: Coin;
}

export default function CoinCard({ coin }: CoinCardProps) {
    const { exchangeRate } = useSettings();
    const vesValue = coin.amount * exchangeRate;

    return (
        <div className={cn(
            "aspect-[1.586] w-full rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden",
            "bg-gradient-to-br from-primary/30 to-accent/30 border border-white/20 shadow-2xl backdrop-blur-lg"
        )}>
             <Image 
                src="/viltrum-logo-2.png" 
                alt="Viltrum Pattern" 
                width={200}
                height={200}
                className="absolute -right-8 -top-8 opacity-10 pointer-events-none rotate-12"
             />

            <div className="relative z-10">
                <div className="flex justify-between items-start">
                    <h2 className="text-xl font-bold text-white">{coin.name}</h2>
                     <Image src={coin.iconUrl} alt={`${coin.name} logo`} width={48} height={48} />
                </div>
                <p className="font-mono text-sm text-primary-foreground/70">{coin.symbol}</p>
            </div>

            <div className="relative z-10 text-right">
                <p className="text-sm text-primary-foreground/70">Balance</p>
                <p className="text-3xl font-bold font-headline text-white">
                    {coin.amount.toLocaleString('de-DE')}
                </p>
                <p className="text-sm text-primary-foreground/70">
                    ~{vesValue.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} VES
                </p>
            </div>
        </div>
    )
}
