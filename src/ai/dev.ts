import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-next-steps.ts';
import '@/ai/flows/suggest-optimization-tips.ts';
import '@/ai/flows/analyze-error-and-suggest-fix.ts';
import '@/ai/flows/translate-natural-language-to-command.ts';
import '@/ai/flows/get-system-stats.ts';
