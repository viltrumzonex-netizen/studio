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
import { Mail, Lock, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

const loginSchema = z.object({
  email: z.string().email({ message: 'Dirección de correo inválida.' }),
  password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres.' }),
});

const registerSchema = z.object({
  displayName: z.string().min(3, { message: 'El nombre de usuario debe tener al menos 3 caracteres.'}),
  email: z.string().email({ message: 'Dirección de correo inválida.' }),
  password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres.' }),
});

export default function AuthForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const { toast } = useToast();
  const { login, register } = useAuth();
  
  const form = useForm<z.infer<typeof loginSchema> | z.infer<typeof registerSchema>>({
    resolver: zodResolver(activeTab === 'login' ? loginSchema : registerSchema),
    defaultValues: {
      email: '',
      password: '',
      ...(activeTab === 'register' && { displayName: '' }),
    },
  });

  const handleAuthAction = async (values: z.infer<typeof loginSchema> | z.infer<typeof registerSchema>) => {
    setIsSubmitting(true);
    try {
        if (activeTab === 'login') {
            const { email, password } = values as z.infer<typeof loginSchema>;
            await login(email, password);
            toast({ title: 'Inicio de Sesión Exitoso', description: "¡Bienvenido de vuelta!" });
        } else {
            const { email, password, displayName } = values as z.infer<typeof registerSchema>;
            await register(email, password, displayName);
            toast({ title: 'Registro Exitoso', description: `¡Bienvenido a Viltrum Wallet, ${displayName}!` });
        }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: activeTab === 'login' ? 'Fallo de Autenticación' : 'Fallo en el Registro',
        description: error.message || 'Ocurrió un error desconocido.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form when tab changes
  const onTabChange = (value: string) => {
    setActiveTab(value);
    form.reset({
      email: '',
      password: '',
      ...(value === 'register' && { displayName: '' }),
    });
  }

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-2 bg-white/5">
        <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
        <TabsTrigger value="register">Registrarse</TabsTrigger>
      </TabsList>
      
      <div className="space-y-4 glass-card p-6 mt-4 rounded-lg">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleAuthAction)} className="space-y-6">
            {activeTab === 'register' && (
                 <FormField
                    control={form.control}
                    name="displayName"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Nombre de Usuario</FormLabel>
                        <FormControl>
                            <div className="relative">
                                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Tu nombre de usuario" {...field} className="pl-10" />
                            </div>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            )}
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
                  <FormLabel>Contraseña</FormLabel>                  
                  <FormControl>
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
              {isSubmitting ? (activeTab === 'login' ? 'Iniciando sesión...' : 'Registrando...') : (activeTab === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta')}
            </Button>
          </form>
        </Form>
      </div>
    </Tabs>
  );
}
