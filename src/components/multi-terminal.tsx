
"use client";

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import { Terminal } from '@/components/terminal';
import { FileManager } from '@/components/file-manager';
import type { SessionInfo } from '@/lib/types';
import { SystemMonitor } from '@/components/system-monitor';
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from "react-resizable-panels";
import { ScrollArea } from './ui/scroll-area';

type MultiTerminalProps = {
  sessions: SessionInfo[];
  onDisconnect: (sessionId: string) => void;
  onAddNew: () => void;
};

export function MultiTerminal({ sessions, onDisconnect, onAddNew }: MultiTerminalProps) {
  const [activeTab, setActiveTab] = useState<string>(sessions[0]?.sessionId);

  const handleDisconnect = (sessionId: string) => {
    const sessionIndex = sessions.findIndex(s => s.sessionId === sessionId);
    onDisconnect(sessionId);

    if (activeTab === sessionId && sessions.length > 1) {
        if (sessionIndex > 0) {
            setActiveTab(sessions[sessionIndex - 1].sessionId);
        } else {
            setActiveTab(sessions[sessionIndex + 1].sessionId);
        }
    }
  };

  if (!sessions.length) {
    return null; // or a placeholder/loading state
  }

  return (
    <PanelGroup direction="horizontal" className="flex-1 min-h-0 w-full h-screen">
      <Panel defaultSize={66}>
        <div className="flex flex-col w-full h-screen">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full w-full">
            <div className="flex items-center border-b bg-card">
              <TabsList className="bg-transparent border-none rounded-none p-0">
                {sessions.map(session => (
                  <div key={session.sessionId} className="relative group border-r">
                    <TabsTrigger 
                      value={session.sessionId}
                      className="h-full rounded-none data-[state=active]:bg-background data-[state=active]:shadow-none pr-8"
                    >
                      {session.credentials.username}@{session.credentials.host}
                    </TabsTrigger>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDisconnect(session.sessionId);
                        }}
                        className="absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted-foreground/20 opacity-0 group-hover:opacity-100"
                    >
                        <X className="h-3 w-3"/>
                    </button>
                  </div>
                ))}
              </TabsList>
              <Button variant="ghost" size="icon" className="h-8 w-8 ml-2" onClick={onAddNew}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {sessions.map(session => (
              <TabsContent key={session.sessionId} value={session.sessionId} className="flex-1 h-full mt-0 focus-visible:ring-0 focus-visible:ring-offset-0">
                <Terminal 
                  sessionInfo={session}
                  onDisconnect={() => handleDisconnect(session.sessionId)}
                />
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </Panel>
      <PanelResizeHandle className="w-2 flex items-center justify-center bg-background focus:outline-none focus:ring-2 focus:ring-ring ring-offset-background hover:bg-muted transition-colors">
        <div className="h-10 w-1.5 rounded-full bg-border hover:bg-muted-foreground" />
      </PanelResizeHandle>
      <Panel defaultSize={34}>
          <div className="h-full w-full relative">
            {sessions.map(session => (
                <div key={session.sessionId} className="absolute inset-0 flex flex-col" style={{ display: activeTab === session.sessionId ? 'flex' : 'none' }}>
                    <SystemMonitor sessionId={session.sessionId} />
                    <div className="flex-1 min-h-0">
                      <FileManager sessionId={session.sessionId} />
                    </div>
                </div>
            ))}
          </div>
      </Panel>
    </PanelGroup>
  );
}
