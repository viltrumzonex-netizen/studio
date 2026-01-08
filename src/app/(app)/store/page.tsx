'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShoppingBag } from "lucide-react";
import { useWallet } from "@/hooks/use-wallet";
import PurchaseDialog from "@/components/store/purchase-dialog";
import type { StoreItem } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';


export default function StorePage() {
    const { balance } = useWallet();
    const [storeItems, setStoreItems] = useState<StoreItem[]>([]);
    const { toast } = useToast();

    // The fetchItems logic will be re-implemented with Supabase
    useEffect(() => {
        // You can add mock data here for testing if you like
        // For example:
        // setStoreItems([
        //   { id: 1, name: 'Producto de Prueba', description: 'Esta es una descripción.', price: 10, stock: 5 },
        // ]);
    }, []);


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
                                <PurchaseDialog item={item} userBalance={balance} />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
            
            {storeItems.length === 0 && (
                <div className="text-center mt-12">
                    <p className="text-muted-foreground">No hay productos disponibles en la tienda en este momento.</p>
                </div>
            )}
        </div>
    )
}
