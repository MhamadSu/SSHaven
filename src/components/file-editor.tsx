
"use client";

import { useState, useEffect } from 'react';
import { readFile, writeFile } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CodeEditor } from '@/components/code-editor';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Loader2, Save, Search, X, FilePenLine } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

type FileEditorProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  sessionId: string;
  filePath: string;
  fileName: string;
  onSaveSuccess: () => void;
};

export function FileEditor({ isOpen, onOpenChange, sessionId, filePath, fileName, onSaveSuccess }: FileEditorProps) {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const [showFind, setShowFind] = useState(false);
  const [showReplace, setShowReplace] = useState(false);
  const [findValue, setFindValue] = useState('');
  const [replaceValue, setReplaceValue] = useState('');

  const closeTools = () => {
    setShowFind(false);
    setShowReplace(false);
    setFindValue('');
    setReplaceValue('');
  }

  useEffect(() => {
    if (isOpen && filePath && sessionId) {
      setIsLoading(true);
      setError(null);
      closeTools();
      readFile(sessionId, filePath)
        .then(data => setContent(data))
        .catch(err => setError(`Failed to load file: ${err.message}`))
        .finally(() => setIsLoading(false));
    } else {
        setContent('');
        setError(null);
        closeTools();
    }
  }, [isOpen, filePath, sessionId]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await writeFile(sessionId, filePath, content);
      toast({ title: 'Success', description: `${fileName} has been saved.` });
      onSaveSuccess();
      onOpenChange(false);
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: `Failed to save file: ${e.message}` });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReplace = () => {
    if (!findValue) return;
    const regex = new RegExp(findValue);
    setContent(currentContent => currentContent.replace(regex, replaceValue));
  };
  
  const handleReplaceAll = () => {
      if (!findValue) return;
      const regex = new RegExp(findValue, 'g');
      setContent(currentContent => currentContent.replace(regex, replaceValue));
  };
  
  const handleFindClick = () => {
      if (showReplace) setShowReplace(false);
      setShowFind(p => !p);
  }

  const handleReplaceClick = () => {
      if(showFind) setShowFind(false);
      setShowReplace(p => !p);
  }

  const renderToolbar = () => {
    if (!showFind && !showReplace) return null;

    return (
        <div className="p-2 border rounded-md bg-background flex items-center gap-2">
            <Input 
                placeholder="Find..." 
                value={findValue} 
                onChange={e => setFindValue(e.target.value)}
                className="h-8"
            />
            {showReplace && (
              <>
                <Input 
                    placeholder="Replace with..." 
                    value={replaceValue} 
                    onChange={e => setReplaceValue(e.target.value)}
                    className="h-8"
                />
                <Button variant="outline" size="sm" onClick={handleReplace} disabled={!findValue}>Replace</Button>
                <Button variant="outline" size="sm" onClick={handleReplaceAll} disabled={!findValue}>All</Button>
              </>
            )}
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={closeTools}><X className="h-4 w-4"/></Button>
        </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Editing: {fileName}</DialogTitle>
        </DialogHeader>

        {renderToolbar()}

        <div className="flex-1 min-h-0 relative border rounded-md">
            {isLoading ? (
                <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : error ? (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            ) : (
                <CodeEditor
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    highlightTerm={findValue || (showReplace ? findValue : '')}
                    className="h-full w-full"
                    placeholder="File is empty or content could not be loaded."
                />
            )}
        </div>
        <DialogFooter className="items-center">
            <Button type="button" variant="outline" size="sm" onClick={handleFindClick}>
                <Search className="mr-2 h-4 w-4" />
                Find
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={handleReplaceClick}>
                <FilePenLine className="mr-2 h-4 w-4" />
                Replace
            </Button>
            <div className="flex-1" />
            <DialogClose asChild>
                <Button type="button" variant="secondary">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSave} disabled={isLoading || isSaving || !!error}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Changes
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
