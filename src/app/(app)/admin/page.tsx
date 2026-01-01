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
                <h1 className="text-4xl font-bold font-headline text-glow">Admin Panel</h1>
                <p className="text-muted-foreground mt-1">Manage Viltrum Zone settings and requests.</p>
            </header>

            <div className="grid md:grid-cols-2 gap-8">
                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle>Exchange Rate</CardTitle>
                        <CardDescription>Set the VTC to Bs. exchange rate.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="rate">Current Rate (1 VTC = X Bs.)</Label>
                            <Input id="rate" type="number" defaultValue={currentRate} placeholder="e.g., 36.50" />
                        </div>
                        <Button className="w-full bg-primary hover:bg-primary/90">Update Rate</Button>
                    </CardContent>
                </Card>
            </div>

            <Card className="glass-card">
                <CardHeader>
                    <CardTitle>Recharge Requests</CardTitle>
                    <CardDescription>Approve or deny user VTC recharge requests.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Amount (Bs.)</TableHead>
                                <TableHead>Method</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
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
                                        <Badge variant={req.status === 'pending' ? 'secondary' : 'default'} className={cn(req.status === 'pending' ? "bg-accent/80" : "bg-primary/80")}>
                                            {req.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        {req.status === 'pending' && (
                                            <>
                                                <Button variant="outline" size="sm" className="border-primary/50 text-primary hover:bg-primary/10">Approve</Button>
                                                <Button variant="outline" size="sm" className="border-destructive/50 text-destructive hover:bg-destructive/10">Deny</Button>
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
