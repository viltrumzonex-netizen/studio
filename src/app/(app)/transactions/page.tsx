'use client';

import { Card, CardContent } from "@/components/ui/card";
import { ArrowDownLeft, ArrowUpRight, PlusCircle, ShoppingBag } from "lucide-react";
import { format } from 'date-fns';
import { cn } from "@/lib/utils";
import SendReceiveDialog from "@/components/transactions/send-receive-dialog";
import { useWallet } from "@/hooks/use-wallet";

const typeConfig = {
    'top-up': {
        icon: PlusCircle,
        color: 'text-primary',
        sign: '+'
    },
    'expense': {
        icon: ShoppingBag,
        color: 'text-accent',
        sign: '-'
    },
    'transfer-out': {
        icon: ArrowUpRight,
        color: 'text-accent',
        sign: '-'
    },
    'transfer-in': {
        icon: ArrowDownLeft,
        color: 'text-primary',
        sign: '+'
    }
}

export default function TransactionsPage() {
    const { transactions } = useWallet();
    return (
        <div className="container mx-auto p-4 md:p-8 space-y-6">
            <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                 <div>
                    <h1 className="text-4xl font-bold font-headline text-glow">Actividad</h1>
                    <p className="text-muted-foreground mt-1">Tu historial de transacciones recientes.</p>
                 </div>
                 <SendReceiveDialog />
            </header>
            
            <Card className="glass-card rounded-lg">
                <CardContent className="p-0">
                    <ul className="divide-y divide-white/10">
                        {(transactions || []).map(tx => {
                            const config = typeConfig[tx.type] || typeConfig['expense'];
                            const Icon = config.icon;
                            
                            const iconBg = tx.type === 'top-up' || tx.type === 'transfer-in'
                                ? "bg-primary/20" 
                                : "bg-accent/20";
                            
                            const title = tx.description || 'Transacción';

                            return (
                                <li key={tx.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={cn("flex items-center justify-center w-10 h-10 rounded-full", iconBg)}>
                                            <Icon className={cn("w-5 h-5", config.color)} />
                                        </div>
                                        <div>
                                            <p className="font-semibold capitalize">{title}</p>
                                            <p className="text-sm text-muted-foreground">{format(new Date(tx.createdAt), 'd MMM, h:mm a')}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={cn("font-semibold", config.color)}>
                                            {config.sign} {tx.amount_vtc.toLocaleString('es-VE', {minimumFractionDigits: 2, maximumFractionDigits: 2})} VTC
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
