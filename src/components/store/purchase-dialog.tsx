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
import type { StoreItem } from "@/lib/types";

interface PurchaseDialogProps {
    item: StoreItem;
    userBalance: number;
}

export default function PurchaseDialog({ item, userBalance }: PurchaseDialogProps) {
    const { refreshWallet } = useWallet();
    const { toast } = useToast();
    const canAfford = userBalance >= item.price;
    
    const handlePurchase = async () => {
        if (!canAfford) {
            toast({
                variant: "destructive",
                title: "Saldo Insuficiente",
                description: `No tienes suficientes VTC para canjear ${item.name}.`,
            });
            return;
        }

        try {
            // This will be re-implemented with Supabase
            toast({
                title: "Función no implementada",
                description: "La compra de productos se conectará a Supabase pronto."
            });

        } catch(error: any) {
            toast({ variant: 'destructive', title: 'Error en el Canje', description: error.message });
        }
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
