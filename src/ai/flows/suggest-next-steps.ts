'use server';

import { getAiClient } from '@/ai/genkit';
import type { SuggestNextStepsInput, SuggestNextStepsOutput } from '@/lib/types';
import { SuggestNextStepsInputSchema, SuggestNextStepsOutputSchema } from '@/lib/types';

export async function suggestNextSteps(input: SuggestNextStepsInput): Promise<SuggestNextStepsOutput> {
    const ai = getAiClient(input.apiKey);
    
    const prompt = ai.definePrompt({
        name: 'suggestNextStepsPrompt',
        input: {schema: SuggestNextStepsInputSchema.pick({ command: true, output: true})},
        output: {schema: SuggestNextStepsOutputSchema},
        prompt: `You are a helpful AI assistant that provides context, best practices, and next steps after a user executes a command in a Linux terminal.

  Command: {{{command}}}
  Output: {{{output}}}

  Explanation: What did this command do?
  Best Practices: What are some best practices related to this command?
  Next Steps: What are some common or useful follow-up commands?`,
    });
    
    const {output} = await prompt(input);
    return output!;
}
