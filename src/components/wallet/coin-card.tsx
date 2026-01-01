import type { Coin } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from 'next/image';

// Mini-panel de configuración:
// Para cambiar el tamaño del icono, indica un nuevo valor para ICON_SIZE.
const ICON_SIZE = 64;

export default function CoinCard({ coin }: { coin: Coin }) {
    return (
        <Card className="glass-card rounded-lg hover:border-primary/50 transition-colors duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium">{coin.name}</CardTitle>
                <div className="p-2 bg-white/10 rounded-full">
                     <Image src={coin.iconUrl} alt={`${coin.name} logo`} width={ICON_SIZE} height={ICON_SIZE} />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">
                    {coin.amount.toLocaleString('es-VE')} {coin.symbol}
                </div>
                <p className="text-xs text-muted-foreground">
                    ~${coin.usdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
            </CardContent>
        </Card>
    )
}
