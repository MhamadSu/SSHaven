
"use client";

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Play, AlertCircle, HardDrive, Plus, Trash2, Edit, Server, X, Settings } from 'lucide-react';
import type { SshCredentials, SessionInfo } from '@/lib/types';
import { connectSsh } from '@/lib/actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { SshConnectForm } from './ssh-connect-form';
import { SettingsDialog } from './settings-dialog';
import { useLocalStorage } from '@/hooks/use-local-storage';

type ServerListProps = {
  onConnect: (sessionInfo: SessionInfo) => void;
  onCancel?: () => void;
};

export function ServerList({ onConnect, onCancel }: ServerListProps) {
  const [servers, setServers] = useLocalStorage<SshCredentials[]>('ssh-servers', []);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [error, setError] = useState<{ id: string, message: string } | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [serverToEdit, setServerToEdit] = useState<SshCredentials | null>(null);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const handleSaveServer = (server: SshCredentials) => {
    setServers(prev => {
      const existing = prev.find(s => s.id === server.id);
      if (existing) {
        return prev.map(s => s.id === server.id ? server : s);
      }
      return [...prev, server];
    });
    setServerToEdit(null);
  };

  const handleEdit = (server: SshCredentials) => {
    setServerToEdit(server);
    setIsFormOpen(true);
  }

  const handleAddNew = () => {
    setServerToEdit(null);
    setIsFormOpen(true);
  }

  const handleDelete = (id?: string) => {
    if (id) {
        setServers(prev => prev.filter(s => s.id !== id));
    }
  }

  const handleConnect = async (creds: SshCredentials) => {
    if (!creds.id) return;
    setIsLoading(creds.id);
    setError(null);

    const result = await connectSsh(creds);

    if (result.success && result.sessionId) {
        onConnect({ 
            credentials: creds, 
            osInfo: result.osInfo || '',
            sessionId: result.sessionId,
        });
    } else {
        setError({ id: creds.id, message: result.error || 'An unknown error occurred.'});
    }
    
    setIsLoading(null);
  };

  const renderServerList = () => {
    if (!hasMounted) {
      return (
          <Alert>
              <Server className="h-4 w-4" />
              <AlertTitle>Loading servers...</AlertTitle>
              <AlertDescription>
                  Please wait while we load your saved servers.
              </AlertDescription>
          </Alert>
      );
    }

    if (servers.length === 0) {
        return (
            <Alert>
                <Server className="h-4 w-4" />
                <AlertTitle>No servers configured</AlertTitle>
                <AlertDescription>
                    Click "Add New Server" to get started.
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="space-y-2">
            {servers.map(server => (
                <div key={server.id} className="p-3 border rounded-lg flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="font-semibold">{server.username}@{server.host}</span>
                        <span className="text-xs text-muted-foreground">Port: {server.port}</span>
                        {error && error.id === server.id && (
                            <p className="text-xs text-red-400 mt-1">{error.message}</p>
                        )}
                    </div>
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(server)}><Edit className="h-4 w-4"/></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-500" onClick={() => handleDelete(server.id)}><Trash2 className="h-4 w-4"/></Button>
                        <Button size="sm" onClick={() => handleConnect(server)} disabled={!!isLoading}>
                            {isLoading === server.id ? <Loader2 className="animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                            Connect
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 w-full">
      <Card className="w-full max-w-md shadow-2xl">
          <CardHeader>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <HardDrive className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl font-headline">SSHaven</CardTitle>
                        <CardDescription>Your AI-powered terminal assistant</CardDescription>
                    </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsSettingsOpen(true)}>
                    <Settings className="h-5 w-5" />
                </Button>
            </div>
          </CardHeader>
          <CardContent>
            {renderServerList()}
          </CardContent>
          <CardFooter className="flex gap-2">
            {onCancel && (
                <Button variant="outline" onClick={onCancel}>
                    <X className="mr-2 h-4 w-4"/>
                    Cancel
                </Button>
            )}
            <Button className="w-full" onClick={handleAddNew}>
              <Plus className="mr-2 h-4 w-4" />
              Add New Server
            </Button>
          </CardFooter>
      </Card>
      <SshConnectForm 
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSave={handleSaveServer}
        serverToEdit={serverToEdit}
      />
      <SettingsDialog
        isOpen={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
      />
    </div>
  );
}
