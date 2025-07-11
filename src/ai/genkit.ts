import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// In Genkit 1.x, we define a single global 'ai' object.
// The API key is now configured globally via environment variables
// (e.g., GOOGLE_API_KEY) or other platform-specific auth,
// rather than passed per-request. The client-side will need to 
// call a separate action to configure this if it's user-provided.
// For now, we will rely on a .env file.
export const ai = genkit({
    plugins: [googleAI()],
    model: 'googleai/gemini-2.0-flash',
});
