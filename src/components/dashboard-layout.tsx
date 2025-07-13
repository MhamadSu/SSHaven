"use client";

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Terminal, 
  FolderOpen, 
  Activity, 
  ListTodo, 
  Plus, 
  Menu,
  X,
  Server,
  Monitor,
  Wifi,
  WifiOff,
  Network,
  Zap,
  Target,
  Globe
} from 'lucide-react';
import type { SessionInfo } from '@/lib/types';

interface DashboardLayoutProps {
  sessions: SessionInfo[];
  onAddSession: () => void;
  onDisconnectSession: (sessionId: string) => void;
  children: (activeSection: DashboardSection) => React.ReactNode;
}

type DashboardSection = 'terminal' | 'files' | 'status' | 'tasks' | 'networking';

export function DashboardLayout({ 
  sessions, 
  onAddSession, 
  onDisconnectSession, 
  children 
}: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<DashboardSection>('terminal');
  const [isMobile, setIsMobile] = useState(false);

  // Only allow one session
  const currentSession = sessions.length > 0 ? sessions[0] : null;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const sidebarItems = [
    {
      id: 'terminal' as const,
      label: 'SSH Terminal',
      icon: Terminal,
      disabled: !currentSession,
    },
    {
      id: 'files' as const,
      label: 'File Explorer',
      icon: FolderOpen,
      disabled: !currentSession,
    },
    {
      id: 'status' as const,
      label: 'System Status',
      icon: Activity,
      disabled: !currentSession,
    },
    {
      id: 'tasks' as const,
      label: 'Active Tasks',
      icon: ListTodo,
      disabled: !currentSession,
    },
    {
      id: 'networking' as const,
      label: 'Network Tools',
      icon: Network,
      disabled: false, // Available even without session
    },
  ];

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSectionChange = (section: DashboardSection) => {
    setActiveSection(section);
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="flex h-screen bg-background mobile-tap-highlight">
      {/* Mobile Overlay */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden animate-fade-in"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-smooth lg:translate-x-0 lg:static lg:inset-0 glass-effect",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Server className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">SSHaven</h1>
                <p className="text-xs text-muted-foreground">Limitless Power Dashboard</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={toggleSidebar}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <div className="flex-1 p-4">
            <nav className="space-y-2">
              {sidebarItems.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => handleSectionChange(item.id)}
                  disabled={item.disabled}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-smooth btn-touch hover-lift animate-slide-in",
                    activeSection === item.id
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "hover:bg-muted glass-effect",
                    item.disabled && "opacity-50 cursor-not-allowed"
                  )}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="flex-1">{item.label}</span>
                  {item.disabled && (
                    <Badge variant="secondary" className="ml-auto text-xs">
                      No Session
                    </Badge>
                  )}
                </button>
              ))}
            </nav>

            {/* Current Session */}
            <div className="mt-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Current Session</h3>
              <div className="text-sm text-muted-foreground">
                {currentSession ? (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 hover-lift transition-smooth glass-effect animate-slide-in border-l-4 border-green-500">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Wifi className="h-4 w-4 text-green-500 animate-pulse" />
                        <div className="text-sm font-medium truncate">
                          {currentSession.credentials.username}@{currentSession.credentials.host}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDisconnectSession(currentSession.sessionId)}
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive btn-touch hover-lift transition-smooth"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 glass-effect animate-slide-in border-l-4 border-gray-500">
                    <WifiOff className="h-4 w-4 text-gray-500" />
                    <span>No active session</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <div className="flex items-center justify-between p-4 border-b bg-card glass-effect">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden btn-touch hover-lift transition-smooth"
              onClick={toggleSidebar}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="animate-slide-in">
              <h2 className="text-lg font-semibold capitalize">
                {activeSection === 'terminal' ? 'SSH Terminal' : 
                 activeSection === 'files' ? 'File Explorer' : 
                 activeSection === 'status' ? 'System Status' : 
                 activeSection === 'tasks' ? 'Active Tasks' :
                 'Network Tools'}
              </h2>
              <p className="text-xs text-muted-foreground">
                {currentSession ? 
                  `Connected to ${currentSession.credentials.host}` : 
                  'No active session'
                }
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2">
              <div className="flex items-center gap-1 glass-effect px-2 py-1 rounded-md">
                <Monitor className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {currentSession ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
            {!currentSession && (
              <Button
                variant="default"
                size="sm"
                onClick={onAddSession}
                className="flex items-center gap-2 btn-touch hover-lift transition-smooth"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Connect Server</span>
              </Button>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {children(activeSection)}
        </div>
      </div>
    </div>
  );
} 