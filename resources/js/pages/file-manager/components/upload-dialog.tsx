import { useState, useRef } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Server } from '@/types/server';
import { Site } from '@/types/site';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoaderCircleIcon, UploadIcon } from 'lucide-react';

interface UploadDialogProps {
  open: boolean;
  currentPath: string;
  server: Server;
  site?: Site | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UploadDialog({ open, currentPath, server, site, onClose, onSuccess }: UploadDialogProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', currentPath);
    if (site) formData.append('site', String(site.id));

    try {
      await axios.post(route('file-manager.upload', { server: server.id }), formData, {
        onUploadProgress: (e) => {
          if (e.total) {
            setProgress(Math.round((e.loaded * 100) / e.total));
          }
        },
      });
      toast.success('File uploaded successfully');
      if (fileRef.current) fileRef.current.value = '';
      onSuccess();
      onClose();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('Failed to upload file');
      }
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload file</DialogTitle>
          <DialogDescription>
            Upload a file to <span className="font-mono text-xs">{currentPath}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="px-4">
          <Label htmlFor="upload-file">Select file</Label>
          <Input id="upload-file" type="file" ref={fileRef} className="mt-1" />
          {uploading && progress > 0 && (
            <div className="mt-2">
              <div className="bg-muted h-2 overflow-hidden rounded-full">
                <div className="bg-primary h-full transition-all" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-muted-foreground mt-1 text-xs">{progress}%</p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={uploading}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={uploading}>
            {uploading ? <LoaderCircleIcon className="animate-spin" /> : <UploadIcon />}
            Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
