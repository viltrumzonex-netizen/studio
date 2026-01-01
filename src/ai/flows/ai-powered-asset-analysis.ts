'use server';

/**
 * @fileOverview Provides AI-driven suggestions for potential investment options.
 *
 * - getInvestmentSuggestion - A function that returns investment suggestions.
 * - InvestmentSuggestionInput - The input type for the getInvestmentSuggestion function.
 * - InvestmentSuggestionOutput - The return type for the getInvestmentSuggestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const InvestmentSuggestionInputSchema = z.object({
  userPortfolio: z
    .string()
    .describe("A description of the user's current cryptocurrency portfolio."),
  riskTolerance: z
    .string()
    .describe("The user's risk tolerance (e.g., 'high', 'medium', 'low')."),
  investmentGoals: z
    .string()
    .describe("The user's investment goals (e.g., 'long-term growth', 'short-term gains')."),
});
export type InvestmentSuggestionInput = z.infer<typeof InvestmentSuggestionInputSchema>;

const InvestmentSuggestionOutputSchema = z.object({
  suggestedAssets: z
    .array(z.string())
    .describe('A list of cryptocurrency assets suggested for investment.'),
  rationale: z
    .string()
    .describe('The rationale behind the suggested investment options.'),
});
export type InvestmentSuggestionOutput = z.infer<typeof InvestmentSuggestionOutputSchema>;

export async function getInvestmentSuggestion(
  input: InvestmentSuggestionInput
): Promise<InvestmentSuggestionOutput> {
  return investmentSuggestionFlow(input);
}

const investmentSuggestionPrompt = ai.definePrompt({
  name: 'investmentSuggestionPrompt',
  input: {schema: InvestmentSuggestionInputSchema},
  output: {schema: InvestmentSuggestionOutputSchema},
  prompt: `You are an AI investment advisor specializing in cryptocurrency. Based on the user's current portfolio, risk tolerance, and investment goals, provide suggestions for potential investment options.

Current Portfolio: {{{userPortfolio}}}
Risk Tolerance: {{{riskTolerance}}}
Investment Goals: {{{investmentGoals}}}

Suggest specific cryptocurrency assets and provide a rationale for each suggestion.
`,
});

const investmentSuggestionFlow = ai.defineFlow(
  {
    name: 'investmentSuggestionFlow',
    inputSchema: InvestmentSuggestionInputSchema,
    outputSchema: InvestmentSuggestionOutputSchema,
  },
  async input => {
    const {output} = await investmentSuggestionPrompt(input);
    return output!;
  }
);







