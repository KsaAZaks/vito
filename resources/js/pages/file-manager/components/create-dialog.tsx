import { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Server } from '@/types/server';
import { Site } from '@/types/site';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoaderCircleIcon } from 'lucide-react';

interface CreateDialogProps {
  type: 'file' | 'directory' | null;
  currentPath: string;
  server: Server;
  site?: Site | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateDialog({ type, currentPath, server, site, onClose, onSuccess }: CreateDialogProps) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !type) return;

    setLoading(true);
    const path = currentPath.replace(/\/$/, '') + '/' + name.trim();
    const endpoint = type === 'file' ? 'file-manager.create-file' : 'file-manager.create-directory';

    try {
      const data: Record<string, string> = { path };
      if (site) data.site = String(site.id);
      await axios.post(route(endpoint, { server: server.id }), data);
      toast.success(`${type === 'file' ? 'File' : 'Directory'} created successfully`);
      setName('');
      onSuccess();
      onClose();
    } catch {
      toast.error(`Failed to create ${type}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={!!type} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create new {type === 'file' ? 'file' : 'directory'}</DialogTitle>
          <DialogDescription>Enter a name for the new {type === 'file' ? 'file' : 'directory'}.</DialogDescription>
        </DialogHeader>
        <div className="px-4">
          <Label htmlFor="create-name">Name</Label>
          <Input
            id="create-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={type === 'file' ? 'filename.txt' : 'new-folder'}
            className="mt-1"
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            autoFocus
          />
          <p className="text-muted-foreground mt-1 font-mono text-xs">
            {currentPath.replace(/\/$/, '')}/{name || '...'}
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading || !name.trim()}>
            {loading && <LoaderCircleIcon className="animate-spin" />}
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
