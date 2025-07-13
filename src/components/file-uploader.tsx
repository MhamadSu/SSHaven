"use client";
import { useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { uploadFile } from '@/lib/actions';
import { Button } from './ui/button';
import { Loader2, Upload } from 'lucide-react';
type FileUploaderProps = {
  sessionId: string;
  targetPath: string;
  onUploadComplete: () => void;
};
export function FileUploader({ sessionId, targetPath, onUploadComplete }: FileUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUri = e.target?.result as string;
        if (!dataUri) {
          throw new Error('Could not read file.');
        }
        const fullPath = `${targetPath}/${file.name}`.replace(/\/+/g, '/');
        await uploadFile(sessionId, fullPath, dataUri);
        onUploadComplete();
      };
      reader.readAsDataURL(file);
    } catch (e: any) {
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: e.message || 'An unknown error occurred.',
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        disabled={isUploading}
      />
      <Button
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
      >
        {isUploading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Upload className="mr-2 h-4 w-4" />
        )}
        Upload
      </Button>
    </>
  );
}
