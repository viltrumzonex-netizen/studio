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

    const fetchItems = useCallback(async () => {
        try {
            const response = await fetch('/api/store/items', { credentials: 'include' });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Error al cargar los productos de la tienda');
            }
            setStoreItems(data);
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        }
    }, [toast]);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);


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

             <div className="text-center mt-12">
                <p className="text-muted-foreground">Más productos próximamente...</p>
            </div>
        </div>
    )
}
