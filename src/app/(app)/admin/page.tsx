'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { RechargeRequest } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Users } from 'lucide-react';
import { useWallet } from '@/hooks/use-wallet';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
    const { toast } = useToast();
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const { exchangeRate: initialExchangeRate } = useWallet();
    const [exchangeRate, setExchangeRate] = useState(0);
    const [rechargeRequests, setRechargeRequests] = useState<RechargeRequest[]>([]);
    const [userCount, setUserCount] = useState<number>(0);

    // Set initial exchange rate from the wallet hook once available
    useEffect(() => {
        if(initialExchangeRate) {
            setExchangeRate(initialExchangeRate);
        }
    }, [initialExchangeRate]);

    const fetchAdminData = useCallback(async () => {
        try {
            const [rechargeResponse, userCountResponse] = await Promise.all([
                fetch('/api/recharges', { credentials: 'include' }),
                fetch('/api/users/count', { credentials: 'include' })
            ]);
            
            // Handle Recharges
            const rechargeData = await rechargeResponse.json();
            if (rechargeResponse.ok) {
                const requests = rechargeData.map((req: any) => ({
                    ...req,
                    date: new Date(req.createdAt),
                }));
                setRechargeRequests(requests);
            } else {
                throw new Error(rechargeData.message || 'Error al obtener solicitudes');
            }

            // Handle User Count
            const userCountData = await userCountResponse.json();
            if(userCountResponse.ok) {
                setUserCount(userCountData.userCount);
            } else {
                 throw new Error(userCountData.message || 'Error al obtener el conteo de usuarios');
            }
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error de Carga', description: error.message });
        }
    }, [toast]);

    useEffect(() => {
        // Redirect if user is not admin
        if (!authLoading && (!user || user.role !== 'admin')) {
             toast({ variant: 'destructive', title: 'Acceso Denegado', description: 'No tienes permiso para ver esta página.' });
            router.push('/dashboard');
            return;
        }
        
        if (user && user.role === 'admin') {
            fetchAdminData();
        }
    }, [user, authLoading, router, fetchAdminData, toast]);


    const handleRateUpdate = async () => {
        try {
            const response = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: 'exchange_rate', value: exchangeRate.toString() }),
                credentials: 'include'
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al actualizar la tasa.');
            }

            toast({
                title: 'Tasa Actualizada',
                description: `La nueva tasa es 1 VTC = ${exchangeRate} Bs.`,
            });
             // No need to re-fetch, we trust the update
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        }
    };

    const handleStatusChange = async (id: string, newStatus: 'approved' | 'denied') => {
        try {
            const response = await fetch(`/api/recharges/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
                credentials: 'include'
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al actualizar la solicitud.');
            }
            
            toast({
                title: `Solicitud ${newStatus === 'approved' ? 'Aprobada' : 'Denegada'}`,
                description: `La solicitud ${id} ha sido actualizada.`,
                variant: newStatus === 'denied' ? 'destructive' : 'default'
            });

            fetchAdminData(); // Re-fetch all admin data to ensure consistency

        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        }
    };

    if (authLoading || !user || user.role !== 'admin') {
        return null; // Or a loading spinner
    }

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-8">
            <header>
                <h1 className="text-4xl font-bold font-headline text-glow">Panel de Admin</h1>
                <p className="text-muted-foreground mt-1">Gestiona la configuración y las solicitudes de Viltrum Zone.</p>
            </header>

            <div className="grid md:grid-cols-3 gap-8">
                <Card className="glass-card md:col-span-2">
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
                                value={exchangeRate}
                                onChange={(e) => setExchangeRate(parseFloat(e.target.value))}
                                placeholder="ej., 36.50" 
                            />
                        </div>
                        <Button className="w-full bg-primary hover:bg-primary/90" onClick={handleRateUpdate}>Actualizar Tasa</Button>
                    </CardContent>
                </Card>

                 <Card className="glass-card">
                    <CardHeader>
                        <CardTitle>Estadísticas</CardTitle>
                        <CardDescription>Resumen de datos del sistema.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center pt-4">
                       <div className="text-center">
                            <Users className="h-8 w-8 mx-auto text-muted-foreground" />
                            <p className="text-4xl font-bold font-headline text-glow mt-2">{userCount}</p>
                            <p className="text-sm text-muted-foreground">Usuarios Registrados</p>
                       </div>
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
                                    <TableCell>{req.userEmail}</TableCell>
                                    <TableCell>{Number(req.amountBs).toLocaleString('es-VE', { minimumFractionDigits: 2 })}</TableCell>
                                    <TableCell>{req.method}</TableCell>
                                    <TableCell>{req.reference}</TableCell>
                                    <TableCell>{new Date(req.date).toLocaleDateString()}</TableCell>
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
