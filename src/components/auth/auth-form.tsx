'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
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
import { Mail, Lock } from 'lucide-react';

const formSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

export default function AuthForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: 'user@example.com',
      password: 'password',
    },
  });

  const handleAuthAction = async (
    values: z.infer<typeof formSchema>,
    isLogin: boolean
  ) => {
    setIsSubmitting(true);
    try {
      if (isLogin) {
        try {
          await signInWithEmailAndPassword(auth, values.email, values.password);
          toast({ title: 'Login Successful', description: "Welcome back!" });
        } catch (error) {
          // If login fails, try to create an account. This is for demo purposes.
          await createUserWithEmailAndPassword(auth, values.email, values.password);
          toast({ title: 'Demo Account Created', description: "You've been registered with the demo account." });
        }
      } else {
        await createUserWithEmailAndPassword(auth, values.email, values.password);
        toast({ title: 'Account Created', description: "You've successfully registered." });
      }
      // Redirect is handled by the parent page
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Authentication Failed',
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Tabs defaultValue="login" className="w-full">
      <TabsList className="grid w-full grid-cols-2 bg-white/5">
        <TabsTrigger value="login">Login</TabsTrigger>
        <TabsTrigger value="register">Register</TabsTrigger>
      </TabsList>
      <Form {...form}>
        <form className="space-y-6 glass-card p-6 mt-4 rounded-lg">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="you@example.com" {...field} className="pl-10" />
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
                <FormLabel>Password</FormLabel>
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

          <TabsContent value="login" className="m-0 p-0">
            <Button
              type="button"
              onClick={form.handleSubmit((values) => handleAuthAction(values, true))}
              disabled={isSubmitting}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isSubmitting ? 'Logging in...' : 'Login'}
            </Button>
          </TabsContent>
          <TabsContent value="register" className="m-0 p-0">
            <Button
              type="button"
              onClick={form.handleSubmit((values) => handleAuthAction(values, false))}
              disabled={isSubmitting}
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              {isSubmitting ? 'Registering...' : 'Register'}
            </Button>
          </TabsContent>
        </form>
      </Form>
    </Tabs>
  );
}
