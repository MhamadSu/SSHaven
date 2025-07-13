
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { listDirectory, deletePath, renamePath, readFile, writeFile, downloadFile } from '@/lib/actions';
import type { FileEntry } from '@/lib/types';
import { Folder, File, Loader2, ServerCrash, ChevronRight, Home, ArrowUp, Upload, Download } from 'lucide-react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { FileManagerActions } from './file-manager-actions';
import { FileUploader } from './file-uploader';
import { FileEditor } from './file-editor';
import { RenameDialog } from './rename-dialog';
import { useToast } from '@/hooks/use-toast';

function formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

type DialogState = 
  | { type: 'closed' }
  | { type: 'renaming'; path: string; name: string }
  | { type: 'editing'; path: string; name: string }

type FileManagerProps = {
    sessionId: string;
}

export function FileManager({ sessionId }: FileManagerProps) {
    const [path, setPath] = useState('/');
    const [files, setFiles] = useState<FileEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dialogState, setDialogState] = useState<DialogState>({ type: 'closed' });
    const { toast } = useToast();

    const loadDirectory = useCallback(async (newPath: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const results = await listDirectory(sessionId, newPath);
            setFiles(results.sort((a, b) => {
                if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
                return a.name.localeCompare(b.name);
            }));
            setPath(newPath);
        } catch (e: any) {
            setError(e.message || 'Failed to load directory.');
        } finally {
            setIsLoading(false);
        }
    }, [sessionId]);

    useEffect(() => {
        loadDirectory(path);
    }, [sessionId, path]);

    const fullPath = (name: string) => path === '/' ? `/${name}` : `${path}/${name}`;

    const handleItemClick = (item: FileEntry) => {
        if (item.isDirectory) {
            loadDirectory(fullPath(item.name));
        } else {
            setDialogState({ type: 'editing', path: fullPath(item.name), name: item.name });
        }
    };
    
    const handleAction = (action: 'rename' | 'delete' | 'download', item: FileEntry) => {
        const itemPath = fullPath(item.name);
        if (action === 'rename') {
            setDialogState({ type: 'renaming', path: itemPath, name: item.name });
        } else if (action === 'delete') {
            if (confirm(`Are you sure you want to delete ${item.name}? This cannot be undone.`)) {
                handleDelete(itemPath);
            }
        } else if (action === 'download') {
            handleDownload(itemPath, item.name);
        }
    };

    const handleDownload = async (itemPath: string, itemName: string) => {
        try {
            toast({ title: 'Preparing download...', description: `Fetching ${itemName}...` });
            const dataUri = await downloadFile(sessionId, itemPath);
            const link = document.createElement('a');
            link.href = dataUri;
            link.download = itemName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast({ title: 'Download started', description: `${itemName} is downloading.` });
        } catch (e: any) {
            toast({ variant: 'destructive', title: 'Download Failed', description: e.message });
        }
    };

    const handleDelete = async (itemPath: string) => {
        try {
            await deletePath(sessionId, itemPath);
            toast({ title: "Success", description: `${itemPath} has been deleted.` });
            loadDirectory(path);
        } catch (e: any) {
            toast({ variant: 'destructive', title: "Error", description: `Failed to delete: ${e.message}` });
        }
    };

    const handleRename = async (oldPath: string, newName: string) => {
        const newPath = path === '/' ? `/${newName}` : `${path}/${newName}`;
        try {
            await renamePath(sessionId, oldPath, newPath);
            toast({ title: "Success", description: "Renamed successfully." });
            setDialogState({ type: 'closed' });
            loadDirectory(path);
        } catch (e: any) {
            toast({ variant: 'destructive', title: "Error", description: `Failed to rename: ${e.message}` });
        }
    };

    const handleUploadComplete = () => {
        toast({ title: "Upload complete", description: "Your file has been uploaded." });
        loadDirectory(path);
    }

    const handleBreadcrumbClick = (index: number) => {
        const pathSegments = path.split('/').filter(Boolean);
        let newPath = '/';
        if (index > 0) {
            newPath += pathSegments.slice(0, index).join('/');
        }
        loadDirectory(newPath);
    };

    const goUp = () => {
        if (path === '/') return;
        const parts = path.split('/');
        parts.pop();
        const newPath = parts.join('/') || '/';
        loadDirectory(newPath);
    }
    
    const pathSegments = path.split('/').filter(Boolean);
    
    return (
        <div className="flex flex-col h-full bg-card/30 animate-fade-in">
            <header className="p-2 border-b shrink-0 flex items-center justify-between gap-2 glass-effect">
                <div className="flex items-center gap-1 text-sm flex-1 overflow-hidden">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 btn-touch hover-lift transition-smooth" 
                        onClick={goUp} 
                        disabled={path==='/' || isLoading}
                    >
                        <ArrowUp className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-1 overflow-x-auto whitespace-nowrap mobile-scroll-smooth scrollbar-thin">
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="p-1 h-auto btn-touch hover-lift transition-smooth" 
                            onClick={() => handleBreadcrumbClick(0)}
                        >
                            <Home className="h-4 w-4"/>
                        </Button>
                        {pathSegments.map((segment, index) => (
                           <div key={index} className="flex items-center gap-1 animate-slide-in" style={{ animationDelay: `${index * 0.1}s` }}>
                               <ChevronRight className="h-4 w-4 text-muted-foreground" />
                               <Button 
                                   variant="ghost" 
                                   size="sm" 
                                   className="p-1 h-auto btn-touch hover-lift transition-smooth" 
                                   onClick={() => handleBreadcrumbClick(index + 1)}
                               >
                                   {segment}
                               </Button>
                           </div>
                        ))}
                    </div>
                </div>
                <FileUploader sessionId={sessionId} targetPath={path} onUploadComplete={handleUploadComplete} />
            </header>

            <ScrollArea className="flex-1 scrollbar-thin mobile-scroll-smooth">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full p-4 animate-fade-in">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : error ? (
                    <Alert variant="destructive" className="m-4 animate-fade-in">
                        <ServerCrash className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                ) : (
                    <div className="p-2 space-y-1">
                        {files.map((item, index) => (
                            <div
                                key={item.name}
                                className="group w-full text-left p-2 rounded-md hover:bg-accent hover:text-accent-foreground focus:outline-none focus:bg-accent focus:text-accent-foreground transition-smooth flex items-center justify-between text-sm hover-lift glass-effect animate-slide-in"
                                style={{ animationDelay: `${index * 0.05}s` }}
                            >
                                <button 
                                    onClick={() => handleItemClick(item)} 
                                    className="flex items-center gap-3 flex-1 truncate btn-touch touch-action-manipulation"
                                >
                                    {item.isDirectory ? 
                                        <Folder className="h-5 w-5 text-primary" /> : 
                                        <File className="h-5 w-5 text-muted-foreground" />
                                    }
                                    <span className="truncate">{item.name}</span>
                                </button>
                                <div className="flex items-center gap-2">
                                    {!item.isDirectory && (
                                        <span className="text-xs text-muted-foreground hidden md:inline">
                                            {formatBytes(item.size)}
                                        </span>
                                    )}
                                    <FileManagerActions item={item} onAction={handleAction} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </ScrollArea>
            
            <RenameDialog
                isOpen={dialogState.type === 'renaming'}
                onOpenChange={() => setDialogState({ type: 'closed' })}
                currentName={dialogState.type === 'renaming' ? dialogState.name : ''}
                onRename={(newName) => {
                    if (dialogState.type === 'renaming') {
                        handleRename(dialogState.path, newName);
                    }
                }}
            />

            <FileEditor
                 isOpen={dialogState.type === 'editing'}
                 onOpenChange={() => setDialogState({ type: 'closed' })}
                 sessionId={sessionId}
                 filePath={dialogState.type === 'editing' ? dialogState.path : ''}
                 fileName={dialogState.type === 'editing' ? dialogState.name : ''}
                 onSaveSuccess={() => loadDirectory(path)}
             />
        </div>
    )
}
