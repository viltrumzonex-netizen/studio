'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";
import { useWallet } from "@/hooks/use-wallet";
import PurchaseDialog from "@/components/store/purchase-dialog";

const storeItems = [
    { id: 'item-1', name: "1 Hora Extra", price: 10, description: "Una hora adicional de juego en cualquier PC." },
    { id: 'item-2', name: "Boleto de Torneo", price: 50, description: "Entrada para el próximo torneo semanal." },
    { id: 'item-3', name: "Mousepad Gamer", price: 150, description: "Un mousepad de alta calidad para mejorar tu precisión." },
    { id: 'item-4', name: "Bebida Energética", price: 15, description: "Una lata de tu bebida energética favorita." },
    { id: 'item-5', name: "Combo Snack", price: 25, description: "Papas fritas y una bebida." },
];

export default function StorePage() {
    const { getVtcBalance } = useWallet();
    const userBalance = getVtcBalance();

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-8">
            <header>
                <h1 className="text-4xl font-bold font-headline text-glow">Tienda y Canjes</h1>
                <p className="text-muted-foreground mt-1">Usa tus VTC para obtener productos y servicios.</p>
            </header>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {storeItems.map(item => (
                    <Card key={item.id} className="glass-card flex flex-col">
                        <CardHeader>
                            <CardTitle>{item.name}</CardTitle>
                            <CardDescription>{item.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow flex flex-col justify-end">
                            <div className="flex justify-between items-center mt-4">
                                <p className="text-2xl font-bold font-headline text-primary">{item.price} <span className="text-lg">VTC</span></p>
                                <PurchaseDialog item={item} userBalance={userBalance} />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

             <div className="text-center mt-12">
                <p className="text-muted-foreground">Más productos próximamente...</p>
            </div>
        </div>
    )
}
