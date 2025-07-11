'use server';
/**
 * @fileOverview Translates natural language into a shell command.
 *
 * - translateNaturalLanguageToCommand - A function that handles the translation process.
 */

import {ai} from '@/ai/genkit';
import type { TranslateNaturalLanguageToCommandInput, TranslateNaturalLanguageToCommandOutput } from '@/lib/types';
import { TranslateNaturalLanguageToCommandInputSchema, TranslateNaturalLanguageToCommandOutputSchema } from '@/lib/types';


export async function translateNaturalLanguageToCommand(input: TranslateNaturalLanguageToCommandInput): Promise<TranslateNaturalLanguageToCommandOutput> {
  const prompt = ai.definePrompt({
    name: 'translateNaturalLanguageToCommandPrompt',
    input: {schema: TranslateNaturalLanguageToCommandInputSchema.pick({ naturalLanguageQuery: true, osInfo: true })},
    output: {schema: TranslateNaturalLanguageToCommandOutputSchema},
    prompt: `You are a Linux command line expert. Your task is to translate a user's natural language request into a single, executable shell command.

{{#if osInfo}}
The user is on a system with the following characteristics. Use this information to provide the most accurate command (e.g., use 'sudo apt-get' for Debian/Ubuntu, 'sudo yum' for CentOS/RHEL, etc.).
---
OS Information:
{{{osInfo}}}
---
{{else}}
Assume the user is on a Debian-based system (like Ubuntu).
{{/if}}

Always perform actions with appropriate privileges (e.g., use 'sudo' for package installation or system-level changes).

User's request: "{{{naturalLanguageQuery}}}"

Provide only the command as the output. Do not provide any explanation or markdown formatting.`,
  });

  const {output} = await prompt(input);
  return output!;
}
