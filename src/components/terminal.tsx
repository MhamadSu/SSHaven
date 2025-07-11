"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { executeCommand, disconnectSsh, getAiErrorSuggestion, getAiContextSuggestion, translateToCommand, writeToPty, readFromPty, sendSignal } from '@/lib/actions';
import type { HistoryEntry, SessionInfo } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AiSuggestion } from '@/components/ai-suggestion';
import { Power, Terminal as TerminalIcon, ChevronRight, AlertTriangle, Loader2, Sparkles, Wand2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from '@/hooks/use-local-storage';

type TerminalProps = {
    sessionInfo: SessionInfo;
    onDisconnect: () => void;
}

export function Terminal({ sessionInfo, onDisconnect }: TerminalProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [isRiskDialogOpen, setIsRiskDialogOpen] = useState(false);
  const [riskyCommand, setRiskyCommand] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<number | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  
  const [isPolling, setIsPolling] = useState(false);
  const [activeHistoryId, setActiveHistoryId] = useState<number | null>(null);
  const [isCommandRunning, setIsCommandRunning] = useState(false);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const [apiKey] = useLocalStorage<string>('gemini-api-key', '');
  const { credentials, osInfo, sessionId } = sessionInfo;

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    let connectionMessage = `Connected to ${credentials.username}@${credentials.host}.`;
    if (osInfo) {
      const prettyOs = osInfo.split('\n').find(line => line.startsWith('PRETTY_NAME='))?.split('=')[1]?.replace(/"/g, '') || 'Unknown OS';
      connectionMessage += `\nOS Detected: ${prettyOs}. AI commands will be tailored for this system.`;
    }
    connectionMessage += '\nWelcome to SSHaven! Type a command to get started.'

    setHistory([
      {
        id: Date.now(),
        command: `connect ${credentials.username}@${credentials.host}`,
        output: connectionMessage,
        isError: false,
      }
    ]);
  }, [credentials, osInfo]);

  useEffect(() => {
    scrollToBottom();
  }, [history, isPolling]);
  
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
    }
    setIsPolling(false);
    setActiveHistoryId(null);
  }, []);

  const POLLING_INTERVAL = 100;

  const checkCommandStatus = useCallback(async (historyId: number) => {
    try {
      const { output, isRunning, isError } = await readFromPty(sessionId);

      if (!isRunning) {
        stopPolling();
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
        setHistory(prev => {
          const index = prev.findIndex(h => h.id === historyId);
          if (index !== -1) {
            const updatedEntry = { ...prev[index], output, isError };
            return [...prev.slice(0, index), updatedEntry, ...prev.slice(index + 1)];
          }
          return prev;
        });
      } else {
        setHistory(prev => {
          const index = prev.findIndex(h => h.id === historyId);
          if (index !== -1 && prev[index].output !== output) {
            const updatedEntry = { ...prev[index], output };
            return [...prev.slice(0, index), updatedEntry, ...prev.slice(index + 1)];
          }
          return prev;
        });
      }
    } catch (error) {
      console.error('Error polling command output:', error);
      stopPolling();
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      setHistory(prev => {
        const index = prev.findIndex(h => h.id === historyId);
        if (index !== -1) {
          const updatedEntry = { ...prev[index], output: 'Error retrieving command output.', isError: true };
          return [...prev.slice(0, index), updatedEntry, ...prev.slice(index + 1)];
        }
        return prev;
      });
    }
  }, [sessionId]);

  const startPolling = useCallback((historyId: number) => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    setIsPolling(true);
    setActiveHistoryId(historyId);
    pollingIntervalRef.current = setInterval(() => {
      checkCommandStatus(historyId);
    }, POLLING_INTERVAL);
  }, [checkCommandStatus]);

  const pollOutput = useCallback(async () => {
    if (!activeHistoryId) {
        stopPolling();
        return;
    }
    
    await checkCommandStatus(activeHistoryId);
  }, [activeHistoryId, stopPolling]);

  useEffect(() => {
    if (isPolling) {
        pollingIntervalRef.current = setInterval(pollOutput, POLLING_INTERVAL);
    }
    return () => {
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
        }
    };
  }, [isPolling, pollOutput]);

  const handleDisconnect = async () => {
    stopPolling();
    await disconnectSsh(sessionId);
    onDisconnect();
  };
  
  const handleClear = () => {
    setHistory(prev => prev.filter(entry => entry.command.startsWith('connect ')));
  }

  const processCommand = useCallback(async (command: string, force: boolean = false) => {
    const commandToExecute = command.trim();
    if (!commandToExecute) return;
    
    if (commandToExecute === 'clear') {
        handleClear();
        setCurrentCommand('');
        return;
    }
    
    const newHistoryEntry: HistoryEntry = {
      id: Date.now(),
      command: commandToExecute,
      output: '',
      isError: false,
    };
    setHistory(prev => [...prev, newHistoryEntry]);
    setCurrentCommand('');
    
    const result = await executeCommand(sessionId, commandToExecute, force);
    
    if (result.isRisky && !force) {
      setRiskyCommand(commandToExecute);
      setIsRiskDialogOpen(true);
      setHistory(prev => prev.filter(e => e.id !== newHistoryEntry.id));
      return;
    }
    
    if (result.isError) {
        setHistory(prev => prev.map(e => e.id === newHistoryEntry.id ? {...e, output: "A command is already running. Please wait.", isError: true} : e));
    } else {
        startPolling(newHistoryEntry.id);
    }
  }, [sessionId]);

  const handleRiskDialogConfirm = () => {
    if (riskyCommand) {
      processCommand(riskyCommand, true);
    }
    setIsRiskDialogOpen(false);
    setRiskyCommand(null);
  };
  
  const handleRiskDialogCancel = () => {
      if (riskyCommand) {
        setHistory(prev => [
            ...prev,
            {
                id: Date.now(),
                command: riskyCommand,
                output: 'Command execution cancelled by user.',
                isError: true
            }
        ]);
      }
      setIsRiskDialogOpen(false);
      setRiskyCommand(null);
  }

  const handleCommandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPolling) {
      await writeToPty(sessionId, currentCommand);
      setCurrentCommand('');
    } else {
      processCommand(currentCommand);
    }
  };

  const handleAiSuggestion = async (entry: HistoryEntry) => {
    if (!entry || !apiKey) {
      if (!apiKey) {
        toast({
          variant: 'destructive',
          title: 'API Key Required',
          description: 'Please set your Gemini API key in the settings.',
        });
      }
      return;
    }

    setIsAiLoading(entry.id);
    let suggestion;
    if (entry.isError) {
        suggestion = { aiError: await getAiErrorSuggestion({ command: entry.command, errorOutput: entry.output, apiKey }) };
    } else {
        suggestion = { aiContext: await getAiContextSuggestion({ command: entry.command, output: entry.output, apiKey }) };
    }

    setHistory(prev => prev.map(e => e.id === entry.id ? { ...e, ...suggestion } : e));
    setIsAiLoading(null);
  }

  const handleTranslate = async () => {
    if (!currentCommand) return;
    if (!apiKey) {
      toast({
        variant: 'destructive',
        title: 'API Key Required',
        description: 'Please set your Gemini API key in the settings.',
      });
      return;
    }
    setIsTranslating(true);
    try {
      const result = await translateToCommand({ 
        naturalLanguageQuery: currentCommand,
        osInfo: osInfo,
        apiKey: apiKey,
      });
      if (result.command) {
        setCurrentCommand(result.command);
      }
    } catch (e) {
      console.error("Translation failed", e);
      toast({ variant: "destructive", title: "Translation Failed", description: "Could not translate your request to a command."});
    } finally {
      setIsTranslating(false);
    }
  }

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'c' && isPolling) {
      e.preventDefault();
      await sendSignal(sessionId, 'INT');
    }
  }

  const stopCommand = async () => {
    if (isCommandRunning && activeHistoryId !== null) {
      try {
        await writeToPty(sessionId, '\x03'); 
        setIsCommandRunning(false);
        setHistory(prev => [
          ...prev.slice(0, prev.length - 1),
          {
            ...prev[prev.length - 1],
            output: `${prev[prev.length - 1].output}
^C
Command interrupted by user.`,
            isError: true
          }
        ]);
        toast({
          title: "Command Stopped",
          description: "The running command has been interrupted.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to stop the command. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  useEffect(() => {
    if (isPolling && activeHistoryId !== null) {
      setIsCommandRunning(true);
    } else {
      setIsCommandRunning(false);
    }
  }, [isPolling, activeHistoryId]);

  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        const isScrolledToBottom = scrollContainer.scrollTop === scrollContainer.scrollHeight - scrollContainer.clientHeight;
        if (isScrolledToBottom || activeHistoryId !== null) {
          scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }
      }
    }
  }, [history, activeHistoryId]);

  useEffect(() => {
    if (!isPolling && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isPolling]);

  const handleKeyDownInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'c' && e.ctrlKey && isCommandRunning) {
      e.preventDefault();
      stopCommand();
    }
  };

  useEffect(() => {
    const inputElement = inputRef.current;
    if (inputElement) {
      inputElement.addEventListener('keydown', handleKeyDownInput as any);
    }
    return () => {
      if (inputElement) {
        inputElement.removeEventListener('keydown', handleKeyDownInput as any);
      }
    };
  }, [isCommandRunning]);

  const formatAnsiOutput = (text: string): string => {
    return text
      .replace(/\x1B\[0m/g, '</span>')
      .replace(/\x1B\[01;31m/g, '<span style="color: red; font-weight: bold;">')
      .replace(/\x1B\[01;32m/g, '<span style="color: green; font-weight: bold;">')
      .replace(/\x1B\[01;33m/g, '<span style="color: yellow; font-weight: bold;">')
      .replace(/\x1B\[01;34m/g, '<span style="color: blue; font-weight: bold;">')
      .replace(/\x1B\[01;35m/g, '<span style="color: magenta; font-weight: bold;">')
      .replace(/\x1B\[01;36m/g, '<span style="color: cyan; font-weight: bold;">')
      .replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '')
      .replace(/\x1B\[H/g, '')
      .replace(/\x1B\[J/g, '')
      .replace(/\?2004[lh]/g, '');
  };

  return (
    <div className="flex flex-col h-full bg-background text-foreground font-code" onKeyDown={handleKeyDown}>
      <header className="flex items-center justify-between p-2 border-b shrink-0">
        <div className="flex items-center gap-2">
          <TerminalIcon className="h-5 w-5 text-accent" />
          <p className="text-sm">
            <span className="text-muted-foreground">Session:</span> {credentials.username}@{credentials.host}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleDisconnect}
          >
            <Power className="mr-2 h-4 w-4" /> Disconnect
          </Button>
        </div>
      </header>
      
      <div className="flex flex-col h-full" onClick={() => inputRef.current?.focus()}>
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="flex flex-col gap-4">
            {history.map((entry) => (
              <div key={entry.id}>
                <div className="flex items-center gap-2">
                  <span className="text-accent">
                    <ChevronRight className="h-4 w-4" />
                  </span>
                  <span className="font-bold">{entry.command}</span>
                </div>
                {(entry.output || (isPolling && entry.id === activeHistoryId)) && (
                  <pre
                    className={`whitespace-pre-wrap mt-1 text-sm ${
                      entry.isError ? 'text-red-400' : 'text-muted-foreground'
                    }`}
                    style={{ fontFamily: 'monospace' }}
                  >
                    {entry.output.split('\n').map((line, index) => (
                      <div key={index} dangerouslySetInnerHTML={{ __html: formatAnsiOutput(line) }} />
                    ))}
                    {isPolling && entry.id === activeHistoryId && (
                        <span className="inline-block w-2 h-4 ml-1 bg-foreground animate-pulse" />
                    )}
                  </pre>
                )}
                {entry.output && !entry.aiError && !entry.aiContext && (
                  <div className="mt-2">
                      <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleAiSuggestion(entry)} 
                          disabled={isAiLoading === entry.id}>
                          {isAiLoading === entry.id ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                              <Sparkles className="mr-2 h-4 w-4" />
                          )}
                          Get AI Suggestion
                      </Button>
                  </div>
                )}
                {(entry.aiError || entry.aiContext) && (
                  <AiSuggestion
                      command={entry.command}
                      aiError={entry.aiError}
                      aiContext={entry.aiContext}
                      onApplyFix={(fix) => processCommand(fix)}
                      onEditCommand={(cmd) => setCurrentCommand(cmd)}
                  />
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="shrink-0 border-t p-2">
          <form onSubmit={handleCommandSubmit} className="flex items-center gap-2">
              <span className="text-accent"><ChevronRight className="h-5 w-5" /></span>
              <input
                ref={inputRef}
                type="text"
                value={currentCommand}
                onChange={(e) => setCurrentCommand(e.target.value)}
                className="flex-1 bg-transparent focus:outline-none text-base w-full"
                placeholder={isPolling ? "Send input to running command..." : "Enter a command or describe what you want to do..."}
                autoFocus
                disabled={isTranslating}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleTranslate}
                disabled={isTranslating || !currentCommand}
                title="Translate to command"
              >
                {isTranslating ? <Loader2 className="animate-spin" /> : <Wand2 />}
              </Button>
              {isCommandRunning && (
                <Button 
                  type="button"
                  variant="destructive"
                  size="sm" 
                  onClick={stopCommand}
                  className="h-7"
                >
                  <X className="h-4 w-4 mr-1" />
                  Stop
                </Button>
              )}
              <Button type="submit" size="sm" disabled={isTranslating || !currentCommand}>
                  {isPolling ? 'Send' : 'Execute'}
              </Button>
          </form>
        </div>
      </div>


      <AlertDialog open={isRiskDialogOpen} onOpenChange={setIsRiskDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="text-yellow-400" /> Potentially Risky Command
            </AlertDialogTitle>
            <AlertDialogDescription>
              The command "<span className="font-bold text-foreground">{riskyCommand}</span>" can have unintended and irreversible consequences. Are you sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleRiskDialogCancel}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRiskDialogConfirm}>Proceed</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
