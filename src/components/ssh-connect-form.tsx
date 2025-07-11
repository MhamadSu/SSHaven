
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
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{serverToEdit ? 'Edit Server' : 'Add New Server'}</DialogTitle>
              <DialogDescription>
                Enter the connection details for your server. The password will be stored locally.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="host" className="text-right">Host</Label>
                  <Input id="host" name="host" value={creds.host} onChange={handleChange} className="col-span-3 font-code" autoFocus/>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="port" className="text-right">Port</Label>
                  <Input id="port" name="port" type="number" value={creds.port} onChange={handleChange} className="col-span-3 font-code" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">Username</Label>
                <Input id="username" name="username" value={creds.username} onChange={handleChange} className="col-span-3 font-code"/>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right">Password</Label>
                <Input id="password" name="password" type="password" value={creds.password} onChange={handleChange} className="col-span-3 font-code"/>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                  <Button type="button" variant="secondary">Cancel</Button>
              </DialogClose>
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
    </Dialog>
  );
}
