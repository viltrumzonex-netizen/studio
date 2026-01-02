'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Mail, Lock, Info } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const formSchema = z.object({
  email: z.string().email({ message: 'Dirección de correo inválida.' }),
  password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres.' }),
});

export default function AuthForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const { toast } = useToast();
  const { login } = useAuth();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: 'usuario@ejemplo.com', // Default to regular user
      password: 'password',
    },
  });

  const handleAuthAction = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      // Login logic is now handled in useAuth hook based on email
      await login(values.email, values.password);
      toast({ title: 'Inicio de Sesión Exitoso', description: "¡Bienvenido de vuelta!" });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Fallo de Autenticación',
        description: error.message || 'Ocurrió un error desconocido.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2 bg-white/5">
        <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
        <TabsTrigger value="register">Registrarse</TabsTrigger>
      </TabsList>
      
      <div className="space-y-4 glass-card p-6 mt-4 rounded-lg">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Cuentas de Demostración</AlertTitle>
          <AlertDescription className="text-xs">
            Admin: <code className="font-mono">admin@ejemplo.com</code><br/>
            Usuario: <code className="font-mono">usuario@ejemplo.com</code><br/>
            (Contraseña: <code className="font-mono">password</code>)
          </AlertDescription>
        </Alert>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleAuthAction)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo Electrónico</FormLabel>
                  <FormControl>
                      <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="tu@ejemplo.com" {...field} className="pl-10" />
                      </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña</FormLabel>                  <FormControl>
                      <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input type="password" placeholder="••••••••" {...field} className="pl-10" />
                      </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isSubmitting ? (activeTab === 'login' ? 'Iniciando sesión...' : 'Registrando...') : (activeTab === 'login' ? 'Iniciar Sesión' : 'Registrarse')}
            </Button>
          </form>
        </Form>
      </div>
    </Tabs>
  );
}