'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { getInvestmentSuggestion, type InvestmentSuggestionOutput } from '@/ai/flows/ai-powered-asset-analysis';
import { useToast } from '@/hooks/use-toast';
import { BrainCircuit, Sparkles } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

const analysisSchema = z.object({
  userPortfolio: z.string().min(10, { message: "Por favor, describe tu portafolio con al menos 10 caracteres." }),
  riskTolerance: z.enum(['low', 'medium', 'high'], { required_error: 'Debes seleccionar una tolerancia al riesgo.' }),
  investmentGoals: z.string().min(10, { message: "Por favor, describe tus metas con al menos 10 caracteres." }),
});

export default function AnalysisForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<InvestmentSuggestionOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof analysisSchema>>({
    resolver: zodResolver(analysisSchema),
    defaultValues: {
        userPortfolio: "ej., 50% Bitcoin, 30% Ethereum, 20% varias altcoins",
        riskTolerance: "medium",
        investmentGoals: "ej., Crecimiento a largo plazo y diversificación en nuevos proyectos."
    }
  });

  async function onSubmit(values: z.infer<typeof analysisSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const suggestion = await getInvestmentSuggestion(values);
      setResult(suggestion);
    } catch (error) {
      console.error("Falló el análisis de IA:", error);
      toast({
        variant: "destructive",
        title: "Análisis Fallido",
        description: "No se pudo obtener una sugerencia. Por favor, inténtalo más tarde.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
        <Card className="glass-card rounded-lg">
            <CardHeader>
                <CardTitle>Tu Perfil</CardTitle>
                <CardDescription>Proporciona tus detalles de inversión para un análisis personalizado.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                        control={form.control}
                        name="userPortfolio"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Portafolio Actual</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Describe tus tenencias de cripto actuales..." {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        
                        <FormField
                            control={form.control}
                            name="riskTolerance"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                <FormLabel>Tolerancia al Riesgo</FormLabel>
                                <FormControl>
                                    <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex flex-col space-y-1"
                                    >
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl>
                                        <RadioGroupItem value="low" />
                                        </FormControl>
                                        <FormLabel className="font-normal">Baja</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl>
                                        <RadioGroupItem value="medium" />
                                        </FormControl>
                                        <FormLabel className="font-normal">Media</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl>
                                        <RadioGroupItem value="high" />
                                        </FormControl>
                                        <FormLabel className="font-normal">Alta</FormLabel>
                                    </FormItem>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                        control={form.control}
                        name="investmentGoals"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Metas de Inversión</FormLabel>
                            <FormControl>
                                <Textarea placeholder="¿Qué esperas conseguir?" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <Button type="submit" disabled={isLoading} className="w-full bg-primary hover:bg-primary/90">
                           {isLoading ? 'Analizando...' : 'Obtener Sugerencia'} <BrainCircuit className="ml-2 w-4 h-4"/>
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>

        <Card className="glass-card rounded-lg flex flex-col">
            <CardHeader>
                <CardTitle>Sugerencia de IA</CardTitle>
                <CardDescription>La recomendación de nuestra IA basada en tu perfil.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center">
                {isLoading ? (
                    <div className="w-full space-y-4">
                        <Skeleton className="h-6 w-1/3" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-4/5" />
                        <br/>
                        <Skeleton className="h-6 w-1/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                    </div>
                ) : result ? (
                    <div className="space-y-6">
                        <div>
                            <h3 className="font-semibold text-lg flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary" />Activos Sugeridos</h3>
                            <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                                {result.suggestedAssets.map((asset, index) => (
                                    <li key={index}><span className="text-foreground font-medium">{asset}</span></li>
                                ))}
                            </ul>
                        </div>
                        <div>
                             <h3 className="font-semibold text-lg">Justificación</h3>
                             <p className="text-muted-foreground mt-2">{result.rationale}</p>
                        </div>
                    </div>
                ) : (
                    <p className="text-muted-foreground">Tu sugerencia de inversión aparecerá aquí.</p>
                )}
            </CardContent>
        </Card>
    </div>
  );
}
