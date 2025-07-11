// This file is machine-generated - edit with caution!
'use server';
/**
 * @fileOverview A server optimization and security improvement suggestion AI agent.
 *
 * - suggestOptimizationTips - A function that suggests server optimization tips and security improvements.
 * - SuggestOptimizationTipsInput - The input type for the suggestOptimizationTips function.
 * - SuggestOptimizationTipsOutput - The return type for the suggestOptimizationTips function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestOptimizationTipsInputSchema = z.object({
  commandHistory: z
    .string()
    .describe('The history of commands executed on the server.'),
  serverState: z.string().describe('The current state of the server.'),
});
export type SuggestOptimizationTipsInput = z.infer<typeof SuggestOptimizationTipsInputSchema>;

const SuggestOptimizationTipsOutputSchema = z.object({
  suggestions: z
    .string()
    .describe(
      'Suggestions for server optimization and security improvements based on the command history and server state.'
    ),
});
export type SuggestOptimizationTipsOutput = z.infer<typeof SuggestOptimizationTipsOutputSchema>;

export async function suggestOptimizationTips(
  input: SuggestOptimizationTipsInput
): Promise<SuggestOptimizationTipsOutput> {
  return suggestOptimizationTipsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestOptimizationTipsPrompt',
  input: {schema: SuggestOptimizationTipsInputSchema},
  output: {schema: SuggestOptimizationTipsOutputSchema},
  prompt: `You are an AI assistant that provides server optimization and security improvement tips.

  Based on the command history and current server state, suggest potential optimizations and improvements.

  Command History: {{{commandHistory}}}
  Server State: {{{serverState}}}

  Provide concise and actionable suggestions.
  Do not make assumptions about what the user wants to do.
`,
});

const suggestOptimizationTipsFlow = ai.defineFlow(
  {
    name: 'suggestOptimizationTipsFlow',
    inputSchema: SuggestOptimizationTipsInputSchema,
    outputSchema: SuggestOptimizationTipsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
