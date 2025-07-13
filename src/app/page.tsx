
"use client";

import { useState } from 'react';
import { ServerList } from '@/components/server-list';
import { DashboardLayout } from '@/components/dashboard-layout';
import { DashboardContent } from '@/components/dashboard-content';
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

  if (showServerList) {
  return (
        <ServerList 
          onConnect={handleConnect} 
          onCancel={activeSessions.length > 0 ? handleCancelAdd : undefined}
        />
    );
  }

  return (
    <DashboardLayout
      sessions={activeSessions}
      onAddSession={handleAddNewSession}
      onDisconnectSession={handleDisconnect}
    >
      {(activeSection) => (
        <DashboardContent
          activeSection={activeSection}
          sessions={activeSessions}
          onDisconnectSession={handleDisconnect}
        />
      )}
    </DashboardLayout>
  );
}
