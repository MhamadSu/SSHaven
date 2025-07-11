
"use client";

import { useState } from 'react';
import { ServerList } from '@/components/server-list';
import { MultiTerminal } from '@/components/multi-terminal';
import type { SessionInfo } from '@/lib/types';

export default function Home() {
  const [activeSessions, setActiveSessions] = useState<SessionInfo[]>([]);
  const [showServerList, setShowServerList] = useState(true);

  const handleConnect = (newSession: SessionInfo) => {
    if (!activeSessions.find(s => s.sessionId === newSession.sessionId)) {
      setActiveSessions(prevSessions => [...prevSessions, newSession]);
    }
    setShowServerList(false);
  };

  const handleDisconnect = (sessionId: string) => {
    setActiveSessions(prevSessions => {
      const newSessions = prevSessions.filter(s => s.sessionId !== sessionId);
      if (newSessions.length === 0) {
        setShowServerList(true);
      }
      return newSessions;
    });
  };

  const handleAddNewSession = () => {
    setShowServerList(true);
  }

  const handleCancelAdd = () => {
    if (activeSessions.length > 0) {
      setShowServerList(false);
    }
  }

  return (
    <div className="flex h-screen bg-background">
      {showServerList ? (
        <ServerList 
          onConnect={handleConnect} 
          onCancel={activeSessions.length > 0 ? handleCancelAdd : undefined}
        />
      ) : (
        <MultiTerminal 
          sessions={activeSessions}
          onDisconnect={handleDisconnect}
          onAddNew={handleAddNewSession}
        />
      )}
    </div>
  );
}
