'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle2, XCircle, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type StatusCheck = {
    status: boolean;
    message: string;
};

type SystemStatus = {
    dbConnected: StatusCheck;
    exchangeRateSet: StatusCheck;
    systemWalletOk: StatusCheck;
    adminExists: StatusCheck;
};

const StatusItem = ({ title, status, message }: { title: string, status: boolean, message: string }) => (
    <div className="flex items-start">
        <div className="flex-shrink-0">
            {status ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
                <XCircle className="h-5 w-5 text-red-500" />
            )}
        </div>
        <div className="ml-3">
            <p className={cn("font-semibold", status ? "text-foreground" : "text-red-400")}>{title}</p>
            <p className="text-sm text-muted-foreground">{message}</p>
        </div>
    </div>
);

export default function SystemStatusPanel() {
    const [status, setStatus] = useState<SystemStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const fetchStatus = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/system/status', { credentials: 'include' });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Error al obtener el estado del sistema.');
            }
            setStatus(data);
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error de Carga',
                description: error.message
            });
            setStatus(null); // Clear status on error
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchStatus();
    }, [fetchStatus]);

    const allSystemsGo = status && Object.values(status).every(check => check.status);

    return (
        <Card className="glass-card max-w-2xl">
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <AlertTriangle /> Estado del Sistema
                </CardTitle>
                <CardDescription>
                    Diagnóstico de los componentes críticos de la aplicación.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {loading ? (
                    <div className="flex items-center justify-center h-24">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="ml-4">Verificando sistemas...</p>
                    </div>
                ) : status ? (
                    <>
                        <div className="p-4 rounded-lg bg-background/50 border flex items-center gap-4">
                            {allSystemsGo ? (
                                <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0" />
                            ) : (
                                <XCircle className="h-6 w-6 text-red-500 flex-shrink-0" />
                            )}
                            <div>
                                <p className="font-bold">
                                    {allSystemsGo ? 'Todos los sistemas operativos.' : 'Se encontraron problemas de configuración.'}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {allSystemsGo ? 'La aplicación está configurada correctamente.' : 'Revisa los puntos marcados en rojo.'}
                                </p>
                           </div>
                        </div>

                        <div className="grid gap-6">
                            <StatusItem title="Base de Datos" {...status.dbConnected} />
                            <StatusItem title="Tasa de Cambio" {...status.exchangeRateSet} />
                            <StatusItem title="Billetera del Sistema" {...status.systemWalletOk} />
                            <StatusItem title="Usuario Administrador" {...status.adminExists} />
                        </div>
                    </>
                ) : (
                    <div className="text-center text-red-400">
                        <p>No se pudo cargar el estado del sistema.</p>
                    </div>
                )}
                 <div className="text-center pt-4">
                    <Button variant="outline" onClick={fetchStatus} disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Volver a Comprobar
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
