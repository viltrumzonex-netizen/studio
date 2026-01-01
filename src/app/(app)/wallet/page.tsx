import { walletCoins } from "@/lib/mock-data";
import CoinCard from "@/components/wallet/coin-card";

export default function WalletPage() {
    return (
        <div className="container mx-auto p-4 md:p-8 space-y-6">
            <header>
                <h1 className="text-4xl font-bold font-headline text-glow">Mi Billetera</h1>
                <p className="text-muted-foreground mt-1">Un resumen de tus criptoactivos.</p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {walletCoins.map(coin => (
                    <CoinCard key={coin.id} coin={coin} />
                ))}
            </div>
        </div>
    )
}
