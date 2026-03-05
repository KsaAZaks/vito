import AdminLayout from '@/layouts/admin/layout';
import { Head, Link, usePage } from '@inertiajs/react';
import Container from '@/components/container';
import Heading from '@/components/heading';
import { DataTable } from '@/components/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Server } from '@/types/server';
import { PaginatedData } from '@/types';
import DateTime from '@/components/date-time';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EyeIcon } from 'lucide-react';

type AdminServer = Server & {
  project?: { id: number; name: string };
  creator?: { id: number; name: string; email: string };
};

const columns: ColumnDef<AdminServer>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    enableColumnFilter: true,
    cell: ({ row }) => (
      <Link className="hover:underline" href={route('servers.show', { server: row.original.id })} prefetch>
        {row.original.name}
      </Link>
    ),
  },
  {
    accessorKey: 'ip',
    header: 'IP',
    enableColumnFilter: true,
  },
  {
    accessorKey: 'os',
    header: 'OS',
  },
  {
    accessorKey: 'provider',
    header: 'Provider',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <Badge variant={row.original.status_color}>{row.original.status}</Badge>,
  },
  {
    id: 'project',
    header: 'Project',
    cell: ({ row }) => row.original.project?.name ?? '-',
  },
  {
    id: 'creator',
    header: 'Creator',
    cell: ({ row }) => row.original.creator?.name ?? '-',
  },
  {
    accessorKey: 'created_at',
    header: 'Created At',
    cell: ({ row }) => <DateTime date={row.original.created_at} />,
  },
  {
    id: 'actions',
    enableColumnFilter: false,
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex items-center justify-end">
        <Link href={route('servers.show', { server: row.original.id })} prefetch>
          <Button variant="outline" size="sm">
            <EyeIcon />
          </Button>
        </Link>
      </div>
    ),
  },
];

type Page = {
  servers: PaginatedData<AdminServer>;
};

export default function AdminServers() {
  const page = usePage<Page>();

  return (
    <AdminLayout>
      <Head title="All Servers" />

      <Container className="max-w-7xl">
        <Heading title="Servers" description="All servers across all projects" />
        <DataTable columns={columns} paginatedData={page.props.servers} />
      </Container>
    </AdminLayout>
  );
}
