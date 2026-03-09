import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';
import { Server } from '@/types/server';
import { Site } from '@/types/site';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { LoaderCircleIcon } from 'lucide-react';

interface EditFileDialogProps {
  path: string | null;
  server: Server;
  site?: Site | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditFileDialog({ path, server, site, onClose, onSuccess }: EditFileDialogProps) {
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  const query = useQuery<{ content: string }>({
    queryKey: ['file-manager.read', server.id, path, site?.id],
    queryFn: async () => {
      const params: Record<string, string> = { path: path! };
      if (site) params.site = String(site.id);
      const response = await axios.get(route('file-manager.read', { server: server.id }), { params });
      return response.data;
    },
    enabled: !!path,
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (query.data?.content !== undefined) {
      setContent(query.data.content);
    }
  }, [query.data]);

  const handleSave = async () => {
    if (!path) return;
    setSaving(true);
    try {
      const data: Record<string, string> = { path, content };
      if (site) data.site = String(site.id);
      await axios.post(route('file-manager.write', { server: server.id }), data);
      toast.success('File saved successfully');
      onSuccess();
      onClose();
    } catch {
      toast.error('Failed to save file');
    } finally {
      setSaving(false);
    }
  };

  const filename = path ? path.split('/').pop() : '';

  return (
    <Dialog open={!!path} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Edit: {filename}</DialogTitle>
          <DialogDescription className="truncate font-mono text-xs">{path}</DialogDescription>
        </DialogHeader>
        <div className="px-4">
          {query.isLoading ? (
            <Skeleton className="h-[400px] w-full" />
          ) : query.isError ? (
            <div className="text-destructive py-8 text-center text-sm">
              {(query.error as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Failed to read file'}
            </div>
          ) : (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="border-input bg-muted/30 h-[400px] w-full rounded-md border p-3 font-mono text-sm focus:outline-none"
              spellCheck={false}
            />
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || query.isLoading || query.isError}>
            {saving && <LoaderCircleIcon className="animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
