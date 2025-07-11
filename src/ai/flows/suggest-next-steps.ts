'use server';

/**
 * @fileOverview Suggests next steps or context after a successful command execution.
 *
 * - suggestNextSteps - A function that suggests next steps based on the command and its output.
 */

import {ai} from '@/ai/genkit';
import type { SuggestNextStepsInput, SuggestNextStepsOutput } from '@/lib/types';
import { SuggestNextStepsInputSchema, SuggestNextStepsOutputSchema } from '@/lib/types';

export async function suggestNextSteps(input: SuggestNextStepsInput): Promise<SuggestNextStepsOutput> {
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
