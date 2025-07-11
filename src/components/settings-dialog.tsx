
"use client";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { useLocalStorage } from '@/hooks/use-local-storage';

type SettingsDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

export function SettingsDialog({ isOpen, onOpenChange }: SettingsDialogProps) {
  const [apiKey, setApiKey] = useLocalStorage<string>('gemini-api-key', '');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // The key is already saved by the useLocalStorage hook on change.
    // We just need to close the dialog.
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[525px]">
          <form onSubmit={handleSave}>
            <DialogHeader>
              <DialogTitle>Settings</DialogTitle>
              <DialogDescription>
                Configure your personal settings for Term Buddy.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="apiKey" className="text-right">Gemini API Key</Label>
                  <Input 
                    id="apiKey" 
                    name="apiKey" 
                    type="password"
                    value={apiKey} 
                    onChange={(e) => setApiKey(e.target.value)} 
                    className="col-span-3 font-code" 
                    placeholder="Enter your Google AI API key"
                    autoFocus
                  />
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
