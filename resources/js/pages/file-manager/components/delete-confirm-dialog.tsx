import { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Server } from '@/types/server';
import { Site } from '@/types/site';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LoaderCircleIcon } from 'lucide-react';

interface DeleteConfirmDialogProps {
  path: string | null;
  name: string;
  server: Server;
  site?: Site | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeleteConfirmDialog({ path, name, server, site, onClose, onSuccess }: DeleteConfirmDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!path) return;

    setLoading(true);
    try {
      const params: Record<string, string> = { path };
      if (site) params.site = String(site.id);
      await axios.delete(route('file-manager.delete', { server: server.id }), { data: params });
      toast.success('Deleted successfully');
      onSuccess();
      onClose();
    } catch {
      toast.error('Failed to delete');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={!!path} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete {name}</DialogTitle>
          <DialogDescription className="sr-only">Confirm deletion</DialogDescription>
        </DialogHeader>
        <p className="p-4">
          Are you sure you want to delete <strong>{name}</strong>? This action cannot be undone.
        </p>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button variant="destructive" disabled={loading} onClick={handleDelete}>
            {loading && <LoaderCircleIcon className="animate-spin" />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
