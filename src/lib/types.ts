import type { ConnectConfig } from 'ssh2';
import { z } from 'zod';

// Schemas and types for analyze-error-and-suggest-fix flow
export const AnalyzeErrorAndSuggestFixInputSchema = z.object({
  command: z.string().describe('The command that was executed.'),
  errorOutput: z.string().describe('The error output from the command.'),
  apiKey: z.string().optional().describe('The Gemini API key.'),
});
export type AnalyzeErrorAndSuggestFixInput = z.infer<typeof AnalyzeErrorAndSuggestFixInputSchema>;

export const AnalyzeErrorAndSuggestFixOutputSchema = z.object({
  explanation: z.string().describe('A simplified explanation of the error.'),
  suggestedFixes: z.array(z.string()).describe('An array of suggested fixes. Each fix MUST be a single, executable shell command without any descriptive text.'),
});
export type AnalyzeErrorAndSuggestFixOutput = z.infer<typeof AnalyzeErrorAndSuggestFixOutputSchema>;


// Schemas and types for suggest-next-steps flow
export const SuggestNextStepsInputSchema = z.object({
  command: z.string().describe('The command that was executed.'),
  output: z.string().describe('The output of the command.'),
  apiKey: z.string().optional().describe('The Gemini API key.'),
});
export type SuggestNextStepsInput = z.infer<typeof SuggestNextStepsInputSchema>;

export const SuggestNextStepsOutputSchema = z.object({
  explanation: z.string().describe('An explanation of what the command did.'),
  bestPractices: z.string().describe('Best practices related to the command.'),
  nextSteps: z.string().describe('Suggested next steps or follow-up commands.'),
});
export type SuggestNextStepsOutput = z.infer<typeof SuggestNextStepsOutputSchema>;


// Schemas and types for translate-natural-language-to-command flow
export const TranslateNaturalLanguageToCommandInputSchema = z.object({
  naturalLanguageQuery: z.string().describe('The natural language query from the user.'),
  osInfo: z.string().optional().describe('The OS information from /etc/os-release of the target server.'),
  apiKey: z.string().optional().describe('The Gemini API key.'),
});
export type TranslateNaturalLanguageToCommandInput = z.infer<typeof TranslateNaturalLanguageToCommandInputSchema>;

export const TranslateNaturalLanguageToCommandOutputSchema = z.object({
  command: z.string().describe('The translated shell command.'),
});
export type TranslateNaturalLanguageToCommandOutput = z.infer<typeof TranslateNaturalLanguageToCommandOutputSchema>;

// Schemas and types for get-system-stats flow
export const GetSystemStatsInputSchema = z.object({
  rawOutput: z.string().describe('The raw output from system commands like top, df, and free.'),
});
export type GetSystemStatsInput = z.infer<typeof GetSystemStatsInputSchema>;

export const GetSystemStatsOutputSchema = z.object({
    cpu: z.object({
      usage: z.number().describe('The current total CPU usage as a percentage.'),
    }),
    memory: z.object({
      total: z.number().describe('Total memory in MB.'),
      used: z.number().describe('Used memory in MB.'),
    }),
    disk: z.object({
      total: z.number().describe('Total disk space in GB.'),
      used: z.number().describe('Used disk space in GB.'),
    }),
  });
export type SystemStats = z.infer<typeof GetSystemStatsOutputSchema>;


// Alias AI types for easier use in components
export type AiErrorSuggestion = AnalyzeErrorAndSuggestFixOutput;
export type AiContextSuggestion = SuggestNextStepsOutput;

// General application types
export interface SshCredentials extends ConnectConfig {
    id?: string;
}

export type CommandResult = {
  command: string;
  output: string;
  isError: boolean;
  isRisky?: boolean;
  aiError?: AiErrorSuggestion;
  aiContext?: AiContextSuggestion;
};

export type HistoryEntry = {
  id: number;
} & CommandResult;

export type FileEntry = {
    name: string;
    isDirectory: boolean;
    size: number;
    modified: Date;
};

export type SessionInfo = {
    sessionId: string;
    credentials: SshCredentials;
    osInfo: string;
}
