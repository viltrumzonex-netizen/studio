'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { RechargeRequest } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

// Mock data, in a real app this would come from your database
const initialRechargeRequests: RechargeRequest[] = [
    { id: 'REQ-001', user: 'user1@example.com', amountBs: 500, method: 'Pago Móvil', reference: '012345', date: new Date(), status: 'pending' },
    { id: 'REQ-002', user: 'user2@example.com', amountBs: 1200.50, method: 'Binance', reference: 'A-54321', date: new Date(), status: 'pending' },
    { id: 'REQ-003', user: 'user3@example.com', amountBs: 250, method: 'Zinli', reference: 'Z-98765', date: new Date(), status: 'approved' },
];

export default function AdminPage() {
    // Current rate, this would be fetched from your DB
    const currentRate = 36.5; 
    const { toast } = useToast();
    const [rechargeRequests, setRechargeRequests] = useState(initialRechargeRequests);

    const handleStatusChange = (id: string, newStatus: 'approved' | 'denied') => {
        setRechargeRequests(prev => prev.map(req => req.id === id ? { ...req, status: newStatus } : req));
        toast({
            title: `Solicitud ${newStatus === 'approved' ? 'Aprobada' : 'Denegada'}`,
            description: `La solicitud ${id} ha sido actualizada.`,
        });
    };

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-8">
            <header>
                <h1 className="text-4xl font-bold font-headline text-glow">Panel de Admin</h1>
                <p className="text-muted-foreground mt-1">Gestiona la configuración y las solicitudes de Viltrum Zone.</p>
            </header>

            <div className="grid md:grid-cols-2 gap-8">
                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle>Tasa de Cambio</CardTitle>
                        <CardDescription>Establece la tasa de cambio de VTC a Bs.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="rate">Tasa Actual (1 VTC = X Bs.)</Label>
                            <Input id="rate" type="number" defaultValue={currentRate} placeholder="ej., 36.50" />
                        </div>
                        <Button className="w-full bg-primary hover:bg-primary/90">Actualizar Tasa</Button>
                    </CardContent>
                </Card>
            </div>

            <Card className="glass-card">
                <CardHeader>
                    <CardTitle>Solicitudes de Recarga</CardTitle>
                    <CardDescription>Aprueba o deniega las solicitudes de recarga de VTC de los usuarios.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Usuario</TableHead>
                                <TableHead>Monto (Bs.)</TableHead>
                                <TableHead>Método</TableHead>
                                <TableHead>Referencia</TableHead>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rechargeRequests.map(req => (
                                <TableRow key={req.id}>
                                    <TableCell>{req.user}</TableCell>
                                    <TableCell>{req.amountBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}</TableCell>
                                    <TableCell>{req.method}</TableCell>
                                    <TableCell>{req.reference}</TableCell>
                                    <TableCell>{req.date.toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <Badge variant={req.status === 'pending' ? 'secondary' : 'default'} className={cn(
                                            {
                                                'bg-yellow-500/80 text-black': req.status === 'pending',
                                                'bg-green-500/80 text-white': req.status === 'approved',
                                                'bg-red-500/80 text-white': req.status === 'denied',
                                            }
                                            )}>
                                            {req.status === 'pending' ? 'Pendiente' : (req.status === 'approved' ? 'Aprobado' : 'Denegado')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        {req.status === 'pending' && (
                                            <>
                                                <Button variant="outline" size="sm" className="border-green-500/50 text-green-400 hover:bg-green-500/10 hover:text-green-300" onClick={() => handleStatusChange(req.id, 'approved')}>Aprobar</Button>
                                                <Button variant="outline" size="sm" className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300" onClick={() => handleStatusChange(req.id, 'denied')}>Denegar</Button>
                                            </>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
