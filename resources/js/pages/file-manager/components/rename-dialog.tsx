import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Server } from '@/types/server';
import { Site } from '@/types/site';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoaderCircleIcon } from 'lucide-react';

interface RenameDialogProps {
  path: string | null;
  server: Server;
  site?: Site | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RenameDialog({ path, server, site, onClose, onSuccess }: RenameDialogProps) {
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (path) {
      setNewName(path.split('/').pop() ?? '');
    }
  }, [path]);

  const handleSubmit = async () => {
    if (!path || !newName.trim()) return;

    const parentDir = path.substring(0, path.lastIndexOf('/'));
    const newPath = parentDir + '/' + newName.trim();

    if (newPath === path) {
      onClose();
      return;
    }

    setLoading(true);
    try {
      const data: Record<string, string> = { from: path, to: newPath };
      if (site) data.site = String(site.id);
      await axios.post(route('file-manager.rename', { server: server.id }), data);
      toast.success('Renamed successfully');
      onSuccess();
      onClose();
    } catch {
      toast.error('Failed to rename');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={!!path} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rename</DialogTitle>
          <DialogDescription className="truncate font-mono text-xs">{path}</DialogDescription>
        </DialogHeader>
        <div className="px-4">
          <Label htmlFor="rename-input">New name</Label>
          <Input
            id="rename-input"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="mt-1"
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading || !newName.trim()}>
            {loading && <LoaderCircleIcon className="animate-spin" />}
            Rename
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
