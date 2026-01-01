import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { totalBalance, transactions } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownLeft, PlusCircle } from "lucide-react";
import Link from 'next/link';
import { format } from 'date-fns';
import { cn } from "@/lib/utils";
import AnimatedBalance from "@/components/dashboard/animated-balance";

export default function DashboardPage() {
    return (
        <div className="container mx-auto p-4 md:p-8 space-y-8">
            <header>
                <p className="text-muted-foreground">Total Balance</p>
                <AnimatedBalance value={totalBalance} />
            </header>

            <section className="flex gap-4">
                <Button asChild size="lg" className="flex-1 bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 transition-opacity">
                    <Link href="/transactions">
                        <ArrowUpRight className="mr-2 h-5 w-5"/>
                        Send
                    </Link>
                </Button>
                <Button asChild size="lg" className="flex-1 bg-white/10 border border-white/20 hover:bg-white/20">
                     <Link href="/transactions">
                        <ArrowDownLeft className="mr-2 h-5 w-5"/>
                        Receive
                    </Link>
                </Button>
            </section>

            <section>
                 <Card className="glass-card rounded-lg">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-4">
                            {transactions.slice(0, 3).map(tx => {
                                const isSent = tx.type === 'sent';
                                const isTopUp = tx.type === 'top-up';
                                const iconColor = isSent ? "text-accent" : "text-primary";
                                const iconBg = isSent ? "bg-accent/20" : "bg-primary/20";
                                const sign = isSent ? '-' : '+';
                                
                                let title = '';
                                if (isTopUp) {
                                    title = `Top-up from ${tx.from}`;
                                } else {
                                    title = `${tx.type} ${tx.coin.symbol}`;
                                }


                                return (
                                    <li key={tx.id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={cn("flex items-center justify-center w-10 h-10 rounded-full", iconBg)}>
                                                {isTopUp ? <PlusCircle className={cn("w-5 h-5", iconColor)} /> : <tx.coin.icon className={cn("w-5 h-5", iconColor)} /> }
                                            </div>
                                            <div>
                                                <p className="font-semibold capitalize">{title}</p>
                                                <p className="text-sm text-muted-foreground">{format(tx.date, 'MMM d, yyyy')}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={cn("font-semibold", iconColor)}>
                                                {sign} {tx.amount} {tx.coin.symbol}
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
            </section>

            <section>
                <Card className="glass-card rounded-lg bg-gradient-to-br from-primary/10 to-accent/10">
                    <CardHeader>
                        <CardTitle className="text-glow">AI-Powered Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">Get personalized crypto investment suggestions based on your profile.</p>
                        <Button asChild className="bg-primary hover:bg-primary/90">
                            <Link href="/ai-analysis">Analyze My Portfolio</Link>
                        </Button>
                    </CardContent>
                </Card>
            </section>
        </div>
    )
}
