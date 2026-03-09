import { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Server } from '@/types/server';
import { Site } from '@/types/site';
import { FileEntry } from '../types';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { LoaderCircleIcon } from 'lucide-react';

interface PermissionsDialogProps {
  path: string;
  entry: FileEntry;
  server: Server;
  site?: Site | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PermissionsDialog({ path, entry, server, site, onClose, onSuccess }: PermissionsDialogProps) {
  const [permissions, setPermissions] = useState(entry.permissions);
  const [owner, setOwner] = useState(entry.owner);
  const [group, setGroup] = useState(entry.group);
  const [recursive, setRecursive] = useState(false);
  const [savingChmod, setSavingChmod] = useState(false);
  const [savingChown, setSavingChown] = useState(false);

  const handleChmod = async () => {
    setSavingChmod(true);
    try {
      const data: Record<string, string | boolean> = { path, permissions, recursive };
      if (site) data.site = String(site.id);
      await axios.post(route('file-manager.chmod', { server: server.id }), data);
      toast.success('Permissions updated');
      onSuccess();
      onClose();
    } catch {
      toast.error('Failed to change permissions');
    } finally {
      setSavingChmod(false);
    }
  };

  const handleChown = async () => {
    setSavingChown(true);
    try {
      const data: Record<string, string | boolean> = { path, owner, group, recursive };
      if (site) data.site = String(site.id);
      await axios.post(route('file-manager.chown', { server: server.id }), data);
      toast.success('Ownership updated');
      onSuccess();
      onClose();
    } catch {
      toast.error('Failed to change ownership');
    } finally {
      setSavingChown(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Permissions</DialogTitle>
          <DialogDescription className="truncate font-mono text-xs">{path}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 px-4">
          <div>
            <Label htmlFor="permissions-input">Permissions (chmod)</Label>
            <div className="mt-1 flex items-center gap-2">
              <Input
                id="permissions-input"
                value={permissions}
                onChange={(e) => setPermissions(e.target.value)}
                placeholder="755"
                className="w-24 font-mono"
                maxLength={4}
              />
              <Button size="sm" onClick={handleChmod} disabled={savingChmod || !/^[0-7]{3,4}$/.test(permissions)}>
                {savingChmod && <LoaderCircleIcon className="animate-spin" />}
                Apply
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="owner-input">Ownership (chown)</Label>
            <div className="mt-1 flex items-center gap-2">
              <Input
                id="owner-input"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                placeholder="owner"
                className="flex-1"
              />
              <span className="text-muted-foreground">:</span>
              <Input
                id="group-input"
                value={group}
                onChange={(e) => setGroup(e.target.value)}
                placeholder="group"
                className="flex-1"
              />
              <Button size="sm" onClick={handleChown} disabled={savingChown || !owner.trim() || !group.trim()}>
                {savingChown && <LoaderCircleIcon className="animate-spin" />}
                Apply
              </Button>
            </div>
          </div>

          {entry.type === 'directory' && (
            <div className="flex items-center gap-2">
              <Checkbox id="recursive" checked={recursive} onCheckedChange={(checked) => setRecursive(checked === true)} />
              <Label htmlFor="recursive">Apply recursively</Label>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
