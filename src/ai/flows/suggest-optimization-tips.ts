'use server';

import { getAiClient } from '@/ai/genkit';
import {z} from 'genkit';

const SuggestOptimizationTipsInputSchema = z.object({
  commandHistory: z
    .string()
    .describe('The history of commands executed on the server.'),
  serverState: z.string().describe('The current state of the server.'),
  apiKey: z.string().optional().describe('The API key for the AI service.'),
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
  const ai = getAiClient(input.apiKey);
  
  const prompt = ai.definePrompt({
    name: 'suggestOptimizationTipsPrompt',
    input: {schema: SuggestOptimizationTipsInputSchema.pick({ commandHistory: true, serverState: true })},
    output: {schema: SuggestOptimizationTipsOutputSchema},
    prompt: `You are an AI assistant that provides server optimization and security improvement tips.

    Based on the command history and current server state, suggest potential optimizations and improvements.

    Command History: {{{commandHistory}}}
    Server State: {{{serverState}}}

    Provide concise and actionable suggestions.
    Do not make assumptions about what the user wants to do.
  `,
  });

  const {output} = await prompt(input);
  return output!;
}
