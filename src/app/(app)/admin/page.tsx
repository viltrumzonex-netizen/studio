import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Mock data, in a real app this would come from your database
const rechargeRequests = [
    { id: 'REQ-001', user: 'user1@example.com', amountBs: '500.00', method: 'Pago Móvil', date: new Date(), status: 'pending' },
    { id: 'REQ-002', user: 'user2@example.com', amountBs: '1,200.50', method: 'Binance', date: new Date(), status: 'pending' },
    { id: 'REQ-003', user: 'user3@example.com', amountBs: '250.00', method: 'Zinli', date: new Date(), status: 'approved' },
];

export default function AdminPage() {
    // Current rate, this would be fetched from your DB
    const currentRate = 36.5; 

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
                                <TableHead>Fecha</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rechargeRequests.map(req => (
                                <TableRow key={req.id}>
                                    <TableCell>{req.user}</TableCell>
                                    <TableCell>{req.amountBs}</TableCell>
                                    <TableCell>{req.method}</TableCell>
                                    <TableCell>{req.date.toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <Badge variant={req.status === 'pending' ? 'secondary' : 'default'} className={cn(
                                            req.status === 'pending' ? "bg-accent/80" : "bg-primary/80",
                                            req.status === 'approved' ? "bg-green-500/80" : ""
                                            )}>
                                            {req.status === 'pending' ? 'Pendiente' : 'Aprobado'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        {req.status === 'pending' && (
                                            <>
                                                <Button variant="outline" size="sm" className="border-primary/50 text-primary hover:bg-primary/10">Aprobar</Button>
                                                <Button variant="outline" size="sm" className="border-destructive/50 text-destructive hover:bg-destructive/10">Denegar</Button>
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
