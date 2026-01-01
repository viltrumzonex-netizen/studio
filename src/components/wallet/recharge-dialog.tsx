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
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Copy, PlusCircle } from "lucide-react";

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
});


export default function RechargeDialog() {
  const { toast } = useToast();
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

  const onSubmit = (values: z.infer<typeof rechargeSchema>) => {
    console.log("Recharge request submitted:", values);
    toast({
        title: "Solicitud de Recarga Enviada",
        description: "Tu solicitud ha sido enviada y será procesada por un administrador.",
    });
    // In a real app, you would send this data to your backend.
    form.reset();
    setOpen(false); // Close the dialog on successful submission
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