
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { VTC_SYMBOL } from "@/lib/constants";

export default function SendReceiveDialog() {
  const { user } = useAuth();
  const { toast } = useToast();
  // This is a mock address. In a real app, this would be generated per user/coin.
  const myWalletAddress = `0x${user?.uid.slice(0, 10)}...${user?.uid.slice(-4)}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(myWalletAddress);
    toast({ title: "¡Copiado!", description: "Dirección de billetera copiada al portapapeles." });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90">Enviar / Recibir</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] glass-card rounded-lg">
        <Tabs defaultValue="send" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/10">
            <TabsTrigger value="send">Enviar</TabsTrigger>
            <TabsTrigger value="receive">Recibir</TabsTrigger>
          </TabsList>
          <TabsContent value="send" className="mt-4">
            <DialogHeader>
              <DialogTitle>Enviar Cripto</DialogTitle>
              <DialogDescription>
                Ingresa los detalles a continuación. Las transacciones son finales.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="recipient">Dirección del Destinatario</Label>
                <Input id="recipient" placeholder="0x..." />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="asset">Activo</Label>
                <Select defaultValue={VTC_SYMBOL}>
                  <SelectTrigger id="asset">
                    <SelectValue placeholder="Selecciona una moneda" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={VTC_SYMBOL}>
                        Viltrum Coin (VTC)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="amount">Monto</Label>
                <Input id="amount" type="number" placeholder="0.0" />
              </div>
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled>
              Enviar (Próximamente)
            </Button>
          </TabsContent>
          <TabsContent value="receive" className="mt-4">
            <DialogHeader>
              <DialogTitle>Recibir Cripto</DialogTitle>
              <DialogDescription>
                Comparte tu dirección para recibir fondos.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
                <p className="text-center text-sm text-muted-foreground">Tu Dirección de Billetera</p>
                <div className="flex items-center space-x-2 p-3 rounded-md bg-white/10">
                    <p className="text-sm font-mono text-foreground truncate flex-1">{myWalletAddress}</p>
                    <Button variant="ghost" size="icon" onClick={copyToClipboard}>
                        <Copy className="h-4 w-4" />
                    </Button>
                </div>
                <p className="text-xs text-center text-muted-foreground pt-2">Solo envía activos en redes compatibles a esta dirección.</p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
