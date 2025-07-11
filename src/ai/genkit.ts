import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export function getAiClient(apiKey?: string) {
  return genkit({
    plugins: [googleAI({
      apiKey: apiKey
    })],
    model: 'googleai/gemini-2.0-flash',
  });
}

export const ai = genkit({
    plugins: [googleAI()],
    model: 'googleai/gemini-2.0-flash',
});
