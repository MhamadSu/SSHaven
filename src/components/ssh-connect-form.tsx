
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, AlertCircle, Save } from 'lucide-react';
import type { SshCredentials } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"

type SshConnectFormProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (credentials: SshCredentials) => void;
  serverToEdit: SshCredentials | null;
};

const emptyCreds: SshCredentials = {
  host: '',
  port: 22,
  username: '',
  password: '',
  id: '',
};

export function SshConnectForm({ isOpen, onOpenChange, onSave, serverToEdit }: SshConnectFormProps) {
  const [creds, setCreds] = useState<SshCredentials>(serverToEdit || emptyCreds);
  
  useEffect(() => {
    if (serverToEdit) {
      setCreds(serverToEdit);
    } else {
      setCreds(emptyCreds);
    }
  }, [serverToEdit, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setCreds(prev => ({
          ...prev,
          [name]: name === 'port' ? parseInt(value, 10) || 0 : value
      }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...creds, id: creds.id || `ssh-${Date.now()}` });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px] w-[95vw] glass-effect animate-scale-in">
          <form onSubmit={handleSubmit} className="animate-fade-in">
            <DialogHeader>
              <DialogTitle className="animate-slide-in">
                {serverToEdit ? 'Edit Server' : 'Add New Server'}
              </DialogTitle>
              <DialogDescription className="animate-slide-in" style={{ animationDelay: '0.1s' }}>
                Enter the connection details for your server. The password will be stored locally.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4 animate-slide-in" style={{ animationDelay: '0.2s' }}>
                  <Label htmlFor="host" className="text-left sm:text-right">Host</Label>
                  <Input 
                    id="host" 
                    name="host" 
                    value={creds.host} 
                    onChange={handleChange} 
                    className="col-span-1 sm:col-span-3 terminal-font btn-touch transition-smooth focus-visible-ring" 
                    autoFocus
                    placeholder="server.example.com"
                  />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4 animate-slide-in" style={{ animationDelay: '0.3s' }}>
                  <Label htmlFor="port" className="text-left sm:text-right">Port</Label>
                  <Input 
                    id="port" 
                    name="port" 
                    type="number" 
                    value={creds.port} 
                    onChange={handleChange} 
                    className="col-span-1 sm:col-span-3 terminal-font btn-touch transition-smooth focus-visible-ring" 
                    placeholder="22"
                  />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4 animate-slide-in" style={{ animationDelay: '0.4s' }}>
                <Label htmlFor="username" className="text-left sm:text-right">Username</Label>
                <Input 
                  id="username" 
                  name="username" 
                  value={creds.username} 
                  onChange={handleChange} 
                  className="col-span-1 sm:col-span-3 terminal-font btn-touch transition-smooth focus-visible-ring"
                  placeholder="root"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4 animate-slide-in" style={{ animationDelay: '0.5s' }}>
                <Label htmlFor="password" className="text-left sm:text-right">Password</Label>
                <Input 
                  id="password" 
                  name="password" 
                  type="password" 
                  value={creds.password} 
                  onChange={handleChange} 
                  className="col-span-1 sm:col-span-3 terminal-font btn-touch transition-smooth focus-visible-ring"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2 animate-slide-in" style={{ animationDelay: '0.6s' }}>
              <DialogClose asChild>
                  <Button 
                    type="button" 
                    variant="secondary" 
                    className="w-full sm:w-auto btn-touch hover-lift transition-smooth"
                  >
                    Cancel
                  </Button>
              </DialogClose>
              <Button 
                type="submit" 
                className="w-full sm:w-auto btn-touch hover-lift transition-smooth"
              >
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
    </Dialog>
  );
}
