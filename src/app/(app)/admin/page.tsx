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
import { useSettings } from '@/hooks/use-settings';
import { useWallet } from '@/hooks/use-wallet';

export default function AdminPage() {
    const { toast } = useToast();
    const { exchangeRate, setExchangeRate } = useSettings();
    const [localRate, setLocalRate] = useState(exchangeRate);
    const { rechargeRequests, updateRechargeRequest, approveRecharge } = useWallet();

    const handleRateUpdate = () => {
        setExchangeRate(localRate);
        toast({
            title: 'Tasa Actualizada',
            description: `La nueva tasa es 1 VTC = ${localRate} Bs.`,
        });
    };

    const handleStatusChange = (id: string, newStatus: 'approved' | 'denied') => {
        const request = rechargeRequests.find(req => req.id === id);
        if (!request) return;

        if (newStatus === 'approved') {
            const vtcAmount = request.amountBs / exchangeRate;
            approveRecharge(id, vtcAmount);
            toast({
                title: `Solicitud Aprobada`,
                description: `Se acreditaron ${vtcAmount.toFixed(2)} VTC al usuario.`,
            });
        } else {
            updateRechargeRequest(id, newStatus);
            toast({
                variant: 'destructive',
                title: `Solicitud Denegada`,
                description: `La solicitud ${id} ha sido denegada.`,
            });
        }
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
                            <Input 
                                id="rate" 
                                type="number" 
                                value={localRate}
                                onChange={(e) => setLocalRate(parseFloat(e.target.value))}
                                placeholder="ej., 36.50" 
                            />
                        </div>
                        <Button className="w-full bg-primary hover:bg-primary/90" onClick={handleRateUpdate}>Actualizar Tasa</Button>
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
