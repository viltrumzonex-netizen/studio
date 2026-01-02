'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid';
import { walletCoins } from "@/lib/mock-data";


interface PurchaseDialogProps {
    item: {
        id: string;
        name: string;
        price: number;
        description: string;
    };
    userBalance: number;
}


export default function PurchaseDialog({ item, userBalance }: PurchaseDialogProps) {
    const { purchaseItem, addTransaction } = useWallet();
    const { toast } = useToast();
    const canAfford = userBalance >= item.price;
    
    const handlePurchase = () => {
        if (!canAfford) {
            toast({
                variant: "destructive",
                title: "Saldo Insuficiente",
                description: `No tienes suficientes VTC para canjear ${item.name}.`,
            });
            return;
        }

        purchaseItem(item.price);
        const transactionId = `TXN-${uuidv4().slice(0, 8)}`;
        addTransaction({
            id: transactionId,
            type: 'expense',
            coin: walletCoins[0], // VTC
            amount: item.price,
            usdValue: item.price, // Assuming 1 VTC = 1 USD for this mock
            date: new Date(),
            details: item.name,
        });

        toast({
            title: "¡Canje Exitoso!",
            description: `Has canjeado ${item.name} por ${item.price} VTC. ID de canje: ${transactionId}`,
        });
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button className="bg-primary/80 hover:bg-primary" disabled={!canAfford}>
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Canjear
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="glass-card">
                <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar Canje</AlertDialogTitle>
                    <AlertDialogDescription>
                        ¿Estás seguro de que quieres usar <span className="font-bold text-primary">{item.price} VTC</span> para canjear <span className="font-bold text-white">{item.name}</span>? Esta acción es irreversible.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handlePurchase}>
                        Confirmar
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
