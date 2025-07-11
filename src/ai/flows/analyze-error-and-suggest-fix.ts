'use server';

import { getAiClient } from '@/ai/genkit';
import type { AnalyzeErrorAndSuggestFixInput, AnalyzeErrorAndSuggestFixOutput } from '@/lib/types';
import { AnalyzeErrorAndSuggestFixInputSchema, AnalyzeErrorAndSuggestFixOutputSchema } from '@/lib/types';


export async function analyzeErrorAndSuggestFix(input: AnalyzeErrorAndSuggestFixInput): Promise<AnalyzeErrorAndSuggestFixOutput> {
  const ai = getAiClient(input.apiKey);
  
  const prompt = ai.definePrompt({
    name: 'analyzeErrorAndSuggestFixPrompt',
    input: {schema: AnalyzeErrorAndSuggestFixInputSchema.pick({ command: true, errorOutput: true })},
    output: {schema: AnalyzeErrorAndSuggestFixOutputSchema},
    prompt: `You are an AI assistant helping a user debug a command-line error.

The user executed the following command:
\`\`\`
{{{command}}}
\`\`\`

And received the following error output:
\`\`\`
{{{errorOutput}}}
\`\`\`

Explain the issue in simple terms. Then, suggest one or more specific fixes. Each suggested fix must be a single, valid, executable shell command. Do not include any natural language explanation, markdown, or backticks in the suggested fixes.`,
  });

  const {output} = await prompt(input);
  return output!;
}
