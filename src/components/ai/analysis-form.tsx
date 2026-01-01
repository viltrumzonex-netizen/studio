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
  userPortfolio: z.string().min(10, { message: "Please describe your portfolio in at least 10 characters." }),
  riskTolerance: z.enum(['low', 'medium', 'high'], { required_error: 'You need to select a risk tolerance.' }),
  investmentGoals: z.string().min(10, { message: "Please describe your goals in at least 10 characters." }),
});

export default function AnalysisForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<InvestmentSuggestionOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof analysisSchema>>({
    resolver: zodResolver(analysisSchema),
    defaultValues: {
        userPortfolio: "e.g., 50% Bitcoin, 30% Ethereum, 20% various altcoins",
        riskTolerance: "medium",
        investmentGoals: "e.g., Long-term growth and diversification into new projects."
    }
  });

  async function onSubmit(values: z.infer<typeof analysisSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const suggestion = await getInvestmentSuggestion(values);
      setResult(suggestion);
    } catch (error) {
      console.error("AI analysis failed:", error);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "Could not get a suggestion. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
        <Card className="glass-card rounded-lg">
            <CardHeader>
                <CardTitle>Your Profile</CardTitle>
                <CardDescription>Provide your investment details for a personalized analysis.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                        control={form.control}
                        name="userPortfolio"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Current Portfolio</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Describe your current crypto holdings..." {...field} />
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
                                <FormLabel>Risk Tolerance</FormLabel>
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
                                        <FormLabel className="font-normal">Low</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl>
                                        <RadioGroupItem value="medium" />
                                        </FormControl>
                                        <FormLabel className="font-normal">Medium</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl>
                                        <RadioGroupItem value="high" />
                                        </FormControl>
                                        <FormLabel className="font-normal">High</FormLabel>
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
                            <FormLabel>Investment Goals</FormLabel>
                            <FormControl>
                                <Textarea placeholder="What are you hoping to achieve?" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <Button type="submit" disabled={isLoading} className="w-full bg-primary hover:bg-primary/90">
                           {isLoading ? 'Analyzing...' : 'Get Suggestion'} <BrainCircuit className="ml-2 w-4 h-4"/>
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>

        <Card className="glass-card rounded-lg flex flex-col">
            <CardHeader>
                <CardTitle>AI Suggestion</CardTitle>
                <CardDescription>Our AI's recommendation based on your profile.</CardDescription>
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
                            <h3 className="font-semibold text-lg flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary" />Suggested Assets</h3>
                            <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                                {result.suggestedAssets.map((asset, index) => (
                                    <li key={index}><span className="text-foreground font-medium">{asset}</span></li>
                                ))}
                            </ul>
                        </div>
                        <div>
                             <h3 className="font-semibold text-lg">Rationale</h3>
                             <p className="text-muted-foreground mt-2">{result.rationale}</p>
                        </div>
                    </div>
                ) : (
                    <p className="text-muted-foreground">Your investment suggestion will appear here.</p>
                )}
            </CardContent>
        </Card>
    </div>
  );
}
