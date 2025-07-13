"use client";

import { useState, useEffect } from 'react';
import { Terminal } from '@/components/terminal';
import { FileManager } from '@/components/file-manager';
import { SystemMonitor } from '@/components/system-monitor';
import { EnhancedStatusMonitor } from '@/components/enhanced-status-monitor';
import { ActiveTasks } from '@/components/active-tasks';
import { NetworkingTools } from '@/components/networking-tools';
import { TerminalIcon, Server } from 'lucide-react';
import type { SessionInfo, HistoryEntry } from '@/lib/types';

// Terminal state interface for persistence
interface TerminalState {
  history: HistoryEntry[];
  currentCommand: string;
  isPolling: boolean;
  activeHistoryId: number | null;
  isCommandRunning: boolean;
}

interface DashboardContentProps {
  activeSection: 'terminal' | 'files' | 'status' | 'tasks' | 'networking';
  sessions: SessionInfo[];
  onDisconnectSession: (sessionId: string) => void;
}

export function DashboardContent({ 
  activeSection, 
  sessions, 
  onDisconnectSession 
}: DashboardContentProps) {
  // Only support one session
  const currentSession = sessions.length > 0 ? sessions[0] : null;
  
  // State for persisting terminal state across section switches
  const [terminalStates, setTerminalStates] = useState<Record<string, TerminalState>>({});
  
  // Get terminal state for current session
  const currentTerminalState = currentSession ? terminalStates[currentSession.sessionId] : undefined;
  
  // Update terminal state for current session
  const updateTerminalState = (sessionId: string, updates: Partial<TerminalState>) => {
    setTerminalStates(prev => ({
      ...prev,
      [sessionId]: { ...prev[sessionId], ...updates }
    }));
  };

  // Show networking tools regardless of session status
  if (activeSection === 'networking') {
    return <NetworkingTools currentSession={currentSession} />;
  }

  // For other sections, require a session
  if (!currentSession) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Server className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <div className="text-muted-foreground text-lg mb-2">No Active Session</div>
          <p className="text-sm text-muted-foreground">
            Connect to a server to access {
              activeSection === 'terminal' ? 'the terminal' :
              activeSection === 'files' ? 'file management' :
              activeSection === 'status' ? 'system monitoring' :
              'active tasks'
            }
          </p>
        </div>
      </div>
    );
  }

  switch (activeSection) {
    case 'terminal':
      return (
        <div className="flex-1 flex flex-col h-full">
          <div className="flex-1 overflow-hidden">
            <Terminal
              sessionInfo={currentSession}
              onDisconnect={() => onDisconnectSession(currentSession.sessionId)}
              persistentState={currentTerminalState}
              onStateUpdate={(updates) => updateTerminalState(currentSession.sessionId, updates)}
            />
          </div>
        </div>
      );
    
    case 'files':
      return (
        <div className="flex-1 flex flex-col h-full">
          <div className="flex-1 overflow-hidden">
            <FileManager sessionId={currentSession.sessionId} />
          </div>
        </div>
      );
    
    case 'status':
      return (
        <div className="flex-1 flex flex-col h-full">
          <div className="flex-1 overflow-hidden">
            <EnhancedStatusMonitor 
              sessionId={currentSession.sessionId} 
              serverInfo={{
                username: currentSession.credentials.username || '',
                host: currentSession.credentials.host || '',
                port: currentSession.credentials.port || 22
              }}
            />
          </div>
        </div>
      );
    
    case 'tasks':
      return (
        <div className="flex-1 flex flex-col h-full">
          <div className="flex-1 overflow-hidden">
            <ActiveTasks sessionId={currentSession.sessionId} />
          </div>
        </div>
      );
    
    default:
      return null;
  }
} 