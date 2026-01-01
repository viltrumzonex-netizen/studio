import type { Coin } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CoinCard({ coin }: { coin: Coin }) {
    return (
        <Card className="glass-card rounded-lg hover:border-primary/50 transition-colors duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium">{coin.name}</CardTitle>
                <div className="p-2 bg-white/10 rounded-full">
                    <coin.icon className="w-6 h-6 text-foreground" />
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
