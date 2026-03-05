import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { CopyIcon, EyeIcon, LoaderCircleIcon, MoreVerticalIcon, RotateCcwIcon, Trash2Icon } from 'lucide-react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { ConsoleCommand } from '@/types/console-command';
import { Badge } from '@/components/ui/badge';
import DateTime from '@/components/date-time';
import FormSuccessful from '@/components/form-successful';
import { toast } from 'sonner';
import { CheckCircle2Icon } from 'lucide-react';

function Delete({ consoleCommand }: { consoleCommand: ConsoleCommand }) {
  const [open, setOpen] = useState(false);
  const form = useForm();

  const submit = () => {
    form.delete(
      route('site-console.destroy', {
        server: consoleCommand.server_id,
        site: consoleCommand.site_id,
        consoleCommand: consoleCommand.id,
      }),
      {
        onSuccess: () => {
          setOpen(false);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem variant="destructive" onSelect={(e) => e.preventDefault()}>
          <Trash2Icon className="mr-2 size-4" />
          Delete
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete command</DialogTitle>
          <DialogDescription className="sr-only">Delete command</DialogDescription>
        </DialogHeader>
        <p className="p-4">Are you sure you want to delete this command from history?</p>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button variant="destructive" disabled={form.processing} onClick={submit}>
            {form.processing && <LoaderCircleIcon className="animate-spin" />}
            <FormSuccessful successful={form.recentlySuccessful} />
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Rerun({ consoleCommand }: { consoleCommand: ConsoleCommand }) {
  const form = useForm();

  const submit = () => {
    form.post(
      route('site-console.rerun', {
        server: consoleCommand.server_id,
        site: consoleCommand.site_id,
        consoleCommand: consoleCommand.id,
      }),
      {
        preserveScroll: true,
      },
    );
  };

  return (
    <DropdownMenuItem onSelect={submit} disabled={form.processing}>
      <RotateCcwIcon className="mr-2 size-4" />
      Run again
    </DropdownMenuItem>
  );
}

function CopyCommand({ consoleCommand }: { consoleCommand: ConsoleCommand }) {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(consoleCommand.command).then(() => {
      toast(
        <div className="flex items-center gap-2">
          <CheckCircle2Icon className="text-success size-5" />
          Copied to clipboard!
        </div>,
      );
    });
  };

  return (
    <DropdownMenuItem onSelect={copyToClipboard}>
      <CopyIcon className="mr-2 size-4" />
      Copy command
    </DropdownMenuItem>
  );
}

export const columns: ColumnDef<ConsoleCommand>[] = [
  {
    accessorKey: 'command',
    header: 'Command',
    enableColumnFilter: true,
    cell: ({ row }) => {
      return <code className="text-muted-foreground max-w-[300px] truncate text-xs">{row.original.command}</code>;
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    enableColumnFilter: true,
    cell: ({ row }) => {
      return <Badge variant={row.original.status_color}>{row.original.status}</Badge>;
    },
  },
  {
    accessorKey: 'user',
    header: 'User',
    cell: ({ row }) => {
      return <span className="text-muted-foreground text-sm">{row.original.user ?? '-'}</span>;
    },
  },
  {
    accessorKey: 'created_at',
    header: 'Executed At',
    enableSorting: true,
    cell: ({ row }) => {
      return <DateTime date={row.original.created_at} />;
    },
  },
  {
    id: 'actions',
    enableColumnFilter: false,
    enableSorting: false,
    cell: ({ row }) => {
      return (
        <div className="flex items-center justify-end">
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreVerticalIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <Link
                href={route('site-console.show', {
                  server: row.original.server_id,
                  site: row.original.site_id,
                  consoleCommand: row.original.id,
                })}
              >
                <DropdownMenuItem>
                  <EyeIcon className="mr-2 size-4" />
                  View output
                </DropdownMenuItem>
              </Link>
              <Rerun consoleCommand={row.original} />
              <CopyCommand consoleCommand={row.original} />
              <DropdownMenuSeparator />
              <Delete consoleCommand={row.original} />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
