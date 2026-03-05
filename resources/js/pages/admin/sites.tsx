import AdminLayout from '@/layouts/admin/layout';
import { Head, Link, usePage } from '@inertiajs/react';
import Container from '@/components/container';
import Heading from '@/components/heading';
import { DataTable } from '@/components/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Site } from '@/types/site';
import { PaginatedData } from '@/types';
import DateTime from '@/components/date-time';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EyeIcon } from 'lucide-react';

const columns: ColumnDef<Site>[] = [
  {
    accessorKey: 'domain',
    header: 'Domain',
    enableColumnFilter: true,
    cell: ({ row }) => (
      <Link
        className="hover:underline"
        href={route('sites.show', { server: row.original.server_id, site: row.original.id })}
        prefetch
      >
        {row.original.domain}
      </Link>
    ),
  },
  {
    accessorKey: 'type',
    header: 'Type',
  },
  {
    id: 'server',
    header: 'Server',
    cell: ({ row }) => row.original.server?.name ?? '-',
  },
  {
    id: 'project',
    header: 'Project',
    cell: ({ row }) => {
      const server = row.original.server as Site['server'] & { project?: { name: string } };
      return server?.project?.name ?? '-';
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <Badge variant={row.original.status_color}>{row.original.status}</Badge>,
  },
  {
    accessorKey: 'repository',
    header: 'Repository',
    cell: ({ row }) => row.original.repository || '-',
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
        <Link href={route('sites.show', { server: row.original.server_id, site: row.original.id })} prefetch>
          <Button variant="outline" size="sm">
            <EyeIcon />
          </Button>
        </Link>
      </div>
    ),
  },
];

type Page = {
  sites: PaginatedData<Site>;
};

export default function AdminSites() {
  const page = usePage<Page>();

  return (
    <AdminLayout>
      <Head title="All Sites" />

      <Container className="max-w-7xl">
        <Heading title="Sites" description="All sites across all servers and projects" />
        <DataTable columns={columns} paginatedData={page.props.sites} />
      </Container>
    </AdminLayout>
  );
}
