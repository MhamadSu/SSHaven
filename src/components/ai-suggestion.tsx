
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { AiErrorSuggestion, AiContextSuggestion } from "@/lib/types";
import { Lightbulb, Wrench, BookOpen, SkipForward, Pencil } from 'lucide-react';

type AiSuggestionProps = {
  command: string;
  aiError?: AiErrorSuggestion;
  aiContext?: AiContextSuggestion;
  onApplyFix: (fix: string) => void;
  onEditCommand: (command: string) => void;
};

export function AiSuggestion({ command, aiError, aiContext, onApplyFix, onEditCommand }: AiSuggestionProps) {
  if (aiError) {
    return (
      <Card className="mt-2 bg-card/50 border-accent/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-accent text-lg font-headline">
            <Lightbulb className="h-5 w-5" />
            Gemini Suggests a Fix
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-foreground">Explanation</h4>
            <p className="text-sm text-muted-foreground">{aiError.explanation}</p>
          </div>
          {aiError.suggestedFixes.length > 0 && (
            <div>
              <h4 className="font-semibold text-foreground">Suggested Fixes</h4>
              <div className="space-y-2 mt-2">
                  {aiError.suggestedFixes.map((fix, index) => (
                      <div key={index} className="p-2 bg-background rounded-md flex items-center justify-between gap-2">
                          <pre className="text-sm font-code">{fix}</pre>
                          <Button variant="outline" size="sm" onClick={() => onApplyFix(fix)}>
                              <Wrench className="mr-2 h-4 w-4"/>
                              Apply
                          </Button>
                      </div>
                  ))}
              </div>
            </div>
          )}
           <div className="flex gap-2 pt-2">
                <Button variant="ghost" size="sm" onClick={() => onEditCommand(command)}>
                    <Pencil className="mr-2 h-4 w-4"/>
                    Edit Manually
                </Button>
            </div>
        </CardContent>
      </Card>
    );
  }

  if (aiContext) {
    return (
        <Card className="mt-2 bg-card/50 border-primary/20">
            <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary text-lg font-headline">
                <Lightbulb className="h-5 w-5" />
                Gemini's Insights
            </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
                {aiContext.explanation && (
                  <div>
                      <h4 className="font-semibold text-foreground flex items-center gap-2"><BookOpen className="h-4 w-4"/>Explanation</h4>
                      <p className="text-muted-foreground mt-1">{aiContext.explanation}</p>
                  </div>
                )}
                {aiContext.bestPractices && (
                  <div>
                      <h4 className="font-semibold text-foreground flex items-center gap-2"><Wrench className="h-4 w-4"/>Best Practices</h4>
                      <p className="text-muted-foreground mt-1">{aiContext.bestPractices}</p>
                  </div>
                )}
                 {aiContext.nextSteps && (
                  <div>
                      <h4 className="font-semibold text-foreground flex items-center gap-2"><SkipForward className="h-4 w-4"/>Next Steps</h4>
                      <p className="text-muted-foreground mt-1">{aiContext.nextSteps}</p>
                  </div>
                 )}
            </CardContent>
        </Card>
    )
  }

  return null;
}
