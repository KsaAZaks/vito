import { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Server } from '@/types/server';
import { Site } from '@/types/site';
import { FileEntry } from '../types';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArchiveIcon,
  DownloadIcon,
  FileIcon,
  FolderIcon,
  LinkIcon,
  LoaderCircleIcon,
  MoreVerticalIcon,
  PackageOpenIcon,
  PencilIcon,
  ShieldIcon,
  Trash2Icon,
  TypeIcon,
} from 'lucide-react';
import EditFileDialog from './edit-file-dialog';
import RenameDialog from './rename-dialog';
import PermissionsDialog from './permissions-dialog';
import DeleteConfirmDialog from './delete-confirm-dialog';

interface FileTableProps {
  files: FileEntry[];
  loading: boolean;
  currentPath: string;
  server: Server;
  site?: Site | null;
  onDirectoryClick: (entry: FileEntry) => void;
  onRefresh: () => void;
}

function formatSize(bytes: string): string {
  const size = parseInt(bytes, 10);
  if (isNaN(size)) return bytes;
  if (size === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(size) / Math.log(1024));
  return (size / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1) + ' ' + units[i];
}

function formatDate(timestamp: string): string {
  const ts = parseInt(timestamp, 10);
  if (isNaN(ts)) return timestamp;
  return new Date(ts * 1000).toLocaleString();
}

function FileTypeIcon({ type }: { type: FileEntry['type'] }) {
  switch (type) {
    case 'directory':
      return <FolderIcon className="text-primary size-4" />;
    case 'link':
      return <LinkIcon className="text-muted-foreground size-4" />;
    default:
      return <FileIcon className="text-muted-foreground size-4" />;
  }
}

export default function FileTable({ files, loading, currentPath, server, site, onDirectoryClick, onRefresh }: FileTableProps) {
  const [editPath, setEditPath] = useState<string | null>(null);
  const [renamePath, setRenamePath] = useState<string | null>(null);
  const [permissionsEntry, setPermissionsEntry] = useState<{ path: string; entry: FileEntry } | null>(null);
  const [deletePath, setDeletePath] = useState<{ path: string; name: string } | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [archiving, setArchiving] = useState<string | null>(null);
  const [extracting, setExtracting] = useState<string | null>(null);

  const fullPath = (name: string) => currentPath.replace(/\/$/, '') + '/' + name;

  const handleDownload = async (entry: FileEntry) => {
    const path = fullPath(entry.name);
    setDownloading(entry.name);
    try {
      const params: Record<string, string> = { path };
      if (site) params.site = String(site.id);
      const response = await axios.get(route('file-manager.download', { server: server.id }), {
        params,
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = entry.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      toast.error('Failed to download file');
    } finally {
      setDownloading(null);
    }
  };

  const handleArchive = async (entry: FileEntry) => {
    const path = fullPath(entry.name);
    setArchiving(entry.name);
    try {
      const data: Record<string, string> = { path };
      if (site) data.site = String(site.id);
      await axios.post(route('file-manager.archive', { server: server.id }), data);
      toast.success('Archive created successfully');
      onRefresh();
    } catch {
      toast.error('Failed to create archive');
    } finally {
      setArchiving(null);
    }
  };

  const handleExtract = async (entry: FileEntry) => {
    const path = fullPath(entry.name);
    setExtracting(entry.name);
    try {
      const data: Record<string, string> = { path };
      if (site) data.site = String(site.id);
      await axios.post(route('file-manager.extract', { server: server.id }), data);
      toast.success('Archive extracted successfully');
      onRefresh();
    } catch {
      toast.error('Failed to extract archive');
    } finally {
      setExtracting(null);
    }
  };

  const isArchive = (name: string) => {
    return /\.(tar\.gz|tgz|tar\.bz2|tar|zip|gz|bz2)$/i.test(name);
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="border-border overflow-hidden rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 border-b">
              <th className="px-4 py-2 text-left font-medium">Name</th>
              <th className="hidden px-4 py-2 text-left font-medium md:table-cell">Size</th>
              <th className="hidden px-4 py-2 text-left font-medium lg:table-cell">Permissions</th>
              <th className="hidden px-4 py-2 text-left font-medium lg:table-cell">Owner</th>
              <th className="hidden px-4 py-2 text-left font-medium xl:table-cell">Modified</th>
              <th className="w-12 px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {files.length === 0 && (
              <tr>
                <td colSpan={6} className="text-muted-foreground px-4 py-8 text-center">
                  Directory is empty
                </td>
              </tr>
            )}
            {files.map((entry) => (
              <tr key={entry.name} className="hover:bg-muted/30 border-b last:border-b-0">
                <td className="px-4 py-2">
                  <button
                    className="flex items-center gap-2 hover:underline"
                    onClick={() => {
                      if (entry.type === 'directory') {
                        onDirectoryClick(entry);
                      } else {
                        setEditPath(fullPath(entry.name));
                      }
                    }}
                  >
                    <FileTypeIcon type={entry.type} />
                    <span className="truncate">{entry.name}</span>
                  </button>
                </td>
                <td className="text-muted-foreground hidden px-4 py-2 md:table-cell">{entry.type === 'directory' ? '-' : formatSize(entry.size)}</td>
                <td className="text-muted-foreground hidden px-4 py-2 font-mono text-xs lg:table-cell">{entry.permissions}</td>
                <td className="text-muted-foreground hidden px-4 py-2 lg:table-cell">
                  {entry.owner}:{entry.group}
                </td>
                <td className="text-muted-foreground hidden px-4 py-2 xl:table-cell">{formatDate(entry.modified_at)}</td>
                <td className="px-4 py-2">
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreVerticalIcon />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {entry.type !== 'directory' && (
                        <DropdownMenuItem onClick={() => setEditPath(fullPath(entry.name))}>
                          <PencilIcon />
                          Edit
                        </DropdownMenuItem>
                      )}
                      {entry.type !== 'directory' && (
                        <DropdownMenuItem onClick={() => handleDownload(entry)} disabled={downloading === entry.name}>
                          {downloading === entry.name ? <LoaderCircleIcon className="animate-spin" /> : <DownloadIcon />}
                          Download
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => setRenamePath(fullPath(entry.name))}>
                        <TypeIcon />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setPermissionsEntry({ path: fullPath(entry.name), entry })}>
                        <ShieldIcon />
                        Permissions
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleArchive(entry)} disabled={archiving === entry.name}>
                        {archiving === entry.name ? <LoaderCircleIcon className="animate-spin" /> : <ArchiveIcon />}
                        Archive
                      </DropdownMenuItem>
                      {isArchive(entry.name) && (
                        <DropdownMenuItem onClick={() => handleExtract(entry)} disabled={extracting === entry.name}>
                          {extracting === entry.name ? <LoaderCircleIcon className="animate-spin" /> : <PackageOpenIcon />}
                          Extract
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem variant="destructive" onClick={() => setDeletePath({ path: fullPath(entry.name), name: entry.name })}>
                        <Trash2Icon />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <EditFileDialog
        path={editPath}
        server={server}
        site={site}
        onClose={() => setEditPath(null)}
        onSuccess={onRefresh}
      />

      <RenameDialog
        path={renamePath}
        server={server}
        site={site}
        onClose={() => setRenamePath(null)}
        onSuccess={onRefresh}
      />

      {permissionsEntry && (
        <PermissionsDialog
          path={permissionsEntry.path}
          entry={permissionsEntry.entry}
          server={server}
          site={site}
          onClose={() => setPermissionsEntry(null)}
          onSuccess={onRefresh}
        />
      )}

      <DeleteConfirmDialog
        path={deletePath?.path ?? null}
        name={deletePath?.name ?? ''}
        server={server}
        site={site}
        onClose={() => setDeletePath(null)}
        onSuccess={onRefresh}
      />
    </>
  );
}
