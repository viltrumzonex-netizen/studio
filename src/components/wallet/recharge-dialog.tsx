"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Copy, PlusCircle } from "lucide-react";
import { useWallet } from '@/hooks/use-wallet';
import { useAuth } from '@/hooks/use-auth';

const paymentMethods = [
    {
        name: "Pago Móvil",
        details: [
            { label: "Banco", value: "Banco de Venezuela" },
            { label: "Teléfono", value: "+584121156707", copyable: true },
            { label: "Cédula", value: "28530116", copyable: true },
        ]
    },
    {
        name: "Zinli",
        details: [
            { label: "Correo", value: "whilder_2014@hotmail.com", copyable: true },
        ]
    },
    {
        name: "Binance Pay",
        details: [
            { label: "Pay ID / Correo", value: "whilder_2014@hotmail.com", copyable: true },
        ]
    }
];

const rechargeSchema = z.object({
    amountBs: z.preprocess(
        (a) => parseFloat(z.string().parse(a)),
        z.number().positive({ message: "El monto debe ser mayor a 0." })
    ),
    reference: z.string().min(4, { message: "La referencia es muy corta." }),
    method: z.enum(['Pago Móvil', 'Zinli', 'Binance'], { required_error: "Debes seleccionar un método de pago." }),
});


export default function RechargeDialog() {
  const { toast } = useToast();
  const { exchangeRate } = useWallet();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof rechargeSchema>>({
    resolver: zodResolver(rechargeSchema),
    defaultValues: {
      amountBs: 0,
      reference: "",
    },
  });

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "¡Copiado!", description: `${label} copiado al portapapeles.` });
  };

  const onSubmit = async (values: z.infer<typeof rechargeSchema>) => {
    if (!user) {
        toast({ variant: 'destructive', title: "Error", description: "Debes iniciar sesión para recargar." });
        return;
    }

    try {
        const response = await fetch('/api/recharges', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...values, userId: user.uid }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Error al enviar la solicitud.');
        }
        
        toast({
            title: "Solicitud de Recarga Enviada",
            description: "Tu solicitud ha sido enviada y será procesada por un administrador.",
        });

        form.reset();
        setOpen(false);

    } catch (error: any) {
        toast({ variant: 'destructive', title: "Error", description: error.message });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
         <Button className="bg-primary hover:bg-primary/90 text-lg py-6 px-8 rounded-full">
            <PlusCircle className="mr-2 h-5 w-5"/>
            Recargar VTC
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md glass-card rounded-lg">
        <DialogHeader>
          <DialogTitle>Recargar Saldo</DialogTitle>
          <DialogDescription>
            Tasa actual: <span className='font-bold text-primary'>1 VTC = {exchangeRate} Bs</span>.
            Selecciona un método, realiza el pago y luego notifícalo aquí.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
            <Accordion type="single" collapsible className="w-full">
                {paymentMethods.map(method => (
                    <AccordionItem value={method.name} key={method.name}>
                        <AccordionTrigger>{method.name}</AccordionTrigger>
                        <AccordionContent>
                           <ul className="space-y-2 text-sm">
                                {method.details.map(detail => (
                                    <li key={detail.label} className="flex justify-between items-center">
                                        <span className="text-muted-foreground">{detail.label}:</span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono">{detail.value}</span>
                                            {detail.copyable && (
                                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(detail.value, detail.label)}>
                                                    <Copy className="h-3 w-3" />
                                                </Button>
                                            )}
                                        </div>
                                    </li>
                                ))}
                           </ul>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
            
            <div>
                 <h3 className="text-md font-semibold text-center mt-4 mb-2">Notificar Pago</h3>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="method"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Método de Pago Usado</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona el método que usaste" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    <SelectItem value="Pago Móvil">Pago Móvil</SelectItem>
                                    <SelectItem value="Zinli">Zinli</SelectItem>
                                    <SelectItem value="Binance">Binance Pay</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="amountBs"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Monto Pagado (Bs.)</FormLabel>
                                    <FormControl>
                                        <Input type="number" step="0.01" placeholder="Ej: 500.00" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="reference"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nro. de Referencia</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej: 0123456" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <DialogFooter className='pt-4'>
                            <DialogClose asChild>
                                <Button type="button" variant="secondary">Cancelar</Button>
                            </DialogClose>
                            <Button type="submit" className="bg-primary hover:bg-primary/90">Notificar Recarga</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </div>

        </div>

      </DialogContent>
    </Dialog>
  );
}
