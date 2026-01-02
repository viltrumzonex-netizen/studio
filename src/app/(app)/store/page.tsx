'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";

const storeItems = [
    { id: 1, name: "1 Hora Extra", price: 10, description: "Una hora adicional de juego en cualquier PC." },
    { id: 2, name: "Boleto de Torneo", price: 50, description: "Entrada para el próximo torneo semanal." },
    { id: 3, name: "Mousepad Gamer", price: 150, description: "Un mousepad de alta calidad para mejorar tu precisión." },
];

export default function StorePage() {
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
                                <Button className="bg-primary/80 hover:bg-primary">
                                    <ShoppingBag className="mr-2 h-4 w-4" />
                                    Canjear
                                </Button>
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
