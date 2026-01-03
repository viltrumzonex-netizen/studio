"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { Copy, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { VTC_SYMBOL } from "@/lib/constants";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useWallet } from "@/hooks/use-wallet";


const sendSchema = z.object({
  recipientEmail: z.string().email({ message: "Debe ser un correo electrónico válido." }),
  amount: z.preprocess(
    (a) => parseFloat(z.string().parse(a)),
    z.number().positive({ message: "El monto debe ser mayor a 0." })
  ),
  memo: z.string().optional(),
});


export default function SendReceiveDialog() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { balance, refreshWallet } = useWallet();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false);
  
  const myWalletAddress = `0x${user?.uid.slice(0, 10)}...${user?.uid.slice(-4)}`;

  const form = useForm<z.infer<typeof sendSchema>>({
    resolver: zodResolver(sendSchema),
    defaultValues: {
      amount: 0,
      recipientEmail: "",
      memo: "",
    },
  });

  const copyToClipboard = () => {
    navigator.clipboard.writeText(myWalletAddress);
    toast({ title: "¡Copiado!", description: "Dirección de billetera copiada al portapapeles." });
  };

  const handleSend = async (values: z.infer<typeof sendSchema>) => {
    if (values.amount > balance) {
        form.setError("amount", { type: "manual", message: "Saldo insuficiente." });
        return;
    }
    setIsSubmitting(true);
    try {
        const response = await fetch('/api/transactions/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(values),
            credentials: 'include'
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || "Error al enviar la transacción.");
        }

        toast({
            title: "Transacción Exitosa",
            description: `Has enviado ${values.amount} VTC a ${values.recipientEmail}.`
        });
        
        refreshWallet();
        form.reset();
        setOpen(false);

    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error en la Transacción', description: error.message });
    } finally {
        setIsSubmitting(false);
    }
  };


  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
             <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSend)} className="space-y-4 py-4">
                    <FormField
                        control={form.control}
                        name="recipientEmail"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Correo del Destinatario</FormLabel>
                                <FormControl>
                                    <Input placeholder="usuario@ejemplo.com" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Monto en {VTC_SYMBOL}</FormLabel>
                                <FormControl>
                                    <Input type="number" step="any" placeholder="0.00" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="memo"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nota (Opcional)</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ej: Para el almuerzo" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="pt-2">
                        <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="animate-spin" /> : 'Enviar VTC'}
                        </Button>
                    </div>
                </form>
             </Form>
          </TabsContent>
          <TabsContent value="receive" className="mt-4">
            <DialogHeader>
              <DialogTitle>Recibir Cripto</DialogTitle>
              <DialogDescription>
                Para recibir VTC, comparte tu correo electrónico registrado en la app con la otra persona.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
                <p className="text-center text-sm text-muted-foreground">Tu Correo Electrónico</p>
                <div className="flex items-center space-x-2 p-3 rounded-md bg-white/10">
                    <p className="text-sm font-mono text-foreground truncate flex-1">{user?.email}</p>
                    <Button variant="ghost" size="icon" onClick={() => user?.email && copyToClipboard(user.email, 'Correo')}>
                        <Copy className="h-4 w-4" />
                    </Button>
                </div>
                <p className="text-xs text-center text-muted-foreground pt-2">Las transferencias se realizan usando el correo electrónico de tu cuenta.</p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
