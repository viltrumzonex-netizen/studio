import { transactions } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { format } from 'date-fns';
import { cn } from "@/lib/utils";
import SendReceiveDialog from "@/components/transactions/send-receive-dialog";

export default function TransactionsPage() {
    return (
        <div className="container mx-auto p-4 md:p-8 space-y-6">
            <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                 <div>
                    <h1 className="text-4xl font-bold font-headline text-glow">Activity</h1>
                    <p className="text-muted-foreground mt-1">Your recent transaction history.</p>
                 </div>
                 <SendReceiveDialog />
            </header>
            
            <Card className="glass-card rounded-lg">
                <CardContent className="p-0">
                    <ul className="divide-y divide-white/10">
                        {transactions.map(tx => {
                            const isSent = tx.type === 'sent';
                            return (
                                <li key={tx.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={cn("flex items-center justify-center w-10 h-10 rounded-full", isSent ? "bg-accent/20" : "bg-primary/20")}>
                                            {isSent ? <ArrowUpRight className="w-5 h-5 text-accent"/> : <ArrowDownLeft className="w-5 h-5 text-primary"/>}
                                        </div>
                                        <div>
                                            <p className="font-semibold capitalize">{tx.type} {tx.coin.symbol}</p>
                                            <p className="text-sm text-muted-foreground">{format(tx.date, 'MMM d, h:mm a')}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold">
                                            {isSent ? '-' : '+'} {tx.amount} {tx.coin.symbol}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            ${tx.usdValue.toLocaleString('en-US')}
                                        </p>
                                    </div>
                                </li>
                            )
                        })}
                    </ul>
                </CardContent>
            </Card>
        </div>
    )
}
