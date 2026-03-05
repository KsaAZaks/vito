import AdminLayout from '@/layouts/admin/layout';
import { Head, usePage } from '@inertiajs/react';
import Container from '@/components/container';
import Heading from '@/components/heading';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataTable } from '@/components/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { EyeIcon, EyeOffIcon } from 'lucide-react';

interface DatabaseUserCred {
  id: number;
  server_id: number;
  server_name: string;
  server_ip: string;
  username: string;
  password: string;
  databases: string[];
  host: string;
  status: string;
  created_at: string;
}

interface ServerCred {
  id: number;
  name: string;
  ip: string;
  ssh_user: string;
  port: number;
  authentication: Record<string, unknown>;
  public_key: string;
  project_name: string;
  created_at: string;
}

interface ProviderCred {
  id: number;
  type: string;
  provider: string;
  profile?: string;
  name?: string;
  credentials?: Record<string, unknown>;
  access_token?: string;
  url?: string;
  created_at: string;
}

type Page = {
  databaseUsers: { data: DatabaseUserCred[] };
  servers: { data: ServerCred[] };
  serverProviders: { data: ProviderCred[] };
  sourceControls: { data: ProviderCred[] };
  storageProviders: { data: ProviderCred[] };
  dnsProviders: { data: ProviderCred[] };
};

function SecretCell({ value }: { value: string | undefined | null }) {
  const [visible, setVisible] = useState(false);

  if (!value) return <span className="text-muted-foreground">-</span>;

  return (
    <div className="flex items-center gap-1">
      <code className="max-w-[200px] truncate text-xs">{visible ? value : '••••••••'}</code>
      <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setVisible(!visible)}>
        {visible ? <EyeOffIcon className="h-3 w-3" /> : <EyeIcon className="h-3 w-3" />}
      </Button>
    </div>
  );
}

function JsonCell({ value }: { value: Record<string, unknown> | undefined | null }) {
  const [visible, setVisible] = useState(false);

  if (!value || Object.keys(value).length === 0) return <span className="text-muted-foreground">-</span>;

  return (
    <div className="flex items-start gap-1">
      {visible ? (
        <pre className="max-w-[300px] overflow-auto rounded bg-muted p-1 text-xs">{JSON.stringify(value, null, 2)}</pre>
      ) : (
        <code className="text-xs">••••••••</code>
      )}
      <Button variant="ghost" size="sm" className="h-6 w-6 shrink-0 p-0" onClick={() => setVisible(!visible)}>
        {visible ? <EyeOffIcon className="h-3 w-3" /> : <EyeIcon className="h-3 w-3" />}
      </Button>
    </div>
  );
}

const dbUserColumns: ColumnDef<DatabaseUserCred>[] = [
  { accessorKey: 'server_name', header: 'Server' },
  { accessorKey: 'server_ip', header: 'IP' },
  { accessorKey: 'username', header: 'Username', enableColumnFilter: true },
  {
    accessorKey: 'password',
    header: 'Password',
    cell: ({ row }) => <SecretCell value={row.original.password} />,
  },
  {
    accessorKey: 'databases',
    header: 'Databases',
    cell: ({ row }) => (row.original.databases ?? []).join(', ') || '-',
  },
  { accessorKey: 'host', header: 'Host' },
  { accessorKey: 'status', header: 'Status' },
];

const serverCredColumns: ColumnDef<ServerCred>[] = [
  { accessorKey: 'name', header: 'Name', enableColumnFilter: true },
  { accessorKey: 'ip', header: 'IP' },
  { accessorKey: 'ssh_user', header: 'SSH User' },
  { accessorKey: 'port', header: 'Port' },
  {
    accessorKey: 'authentication',
    header: 'Auth',
    cell: ({ row }) => <JsonCell value={row.original.authentication} />,
  },
  {
    accessorKey: 'public_key',
    header: 'Public Key',
    cell: ({ row }) => <SecretCell value={row.original.public_key} />,
  },
  { accessorKey: 'project_name', header: 'Project' },
];

const providerColumns: ColumnDef<ProviderCred>[] = [
  {
    id: 'name',
    header: 'Name',
    enableColumnFilter: true,
    cell: ({ row }) => row.original.profile || row.original.name || '-',
  },
  { accessorKey: 'provider', header: 'Provider' },
  {
    accessorKey: 'credentials',
    header: 'Credentials',
    cell: ({ row }) => <JsonCell value={row.original.credentials} />,
  },
  {
    accessorKey: 'access_token',
    header: 'Token',
    cell: ({ row }) => <SecretCell value={row.original.access_token} />,
  },
  {
    accessorKey: 'url',
    header: 'URL',
    cell: ({ row }) => row.original.url || '-',
  },
];

export default function AdminCredentials() {
  const page = usePage<Page>();

  return (
    <AdminLayout>
      <Head title="Credentials" />

      <Container className="max-w-7xl">
        <Heading title="Credentials" description="All passwords and credentials across the system" />

        <Tabs defaultValue="database-users">
          <TabsList>
            <TabsTrigger value="database-users">Database Users ({page.props.databaseUsers.data.length})</TabsTrigger>
            <TabsTrigger value="servers">Servers SSH ({page.props.servers.data.length})</TabsTrigger>
            <TabsTrigger value="server-providers">Server Providers ({page.props.serverProviders.data.length})</TabsTrigger>
            <TabsTrigger value="source-controls">Source Controls ({page.props.sourceControls.data.length})</TabsTrigger>
            <TabsTrigger value="storage-providers">Storage Providers ({page.props.storageProviders.data.length})</TabsTrigger>
            <TabsTrigger value="dns-providers">DNS Providers ({page.props.dnsProviders.data.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="database-users">
            <DataTable columns={dbUserColumns} data={page.props.databaseUsers.data} />
          </TabsContent>

          <TabsContent value="servers">
            <DataTable columns={serverCredColumns} data={page.props.servers.data} />
          </TabsContent>

          <TabsContent value="server-providers">
            <DataTable columns={providerColumns} data={page.props.serverProviders.data} />
          </TabsContent>

          <TabsContent value="source-controls">
            <DataTable columns={providerColumns} data={page.props.sourceControls.data} />
          </TabsContent>

          <TabsContent value="storage-providers">
            <DataTable columns={providerColumns} data={page.props.storageProviders.data} />
          </TabsContent>

          <TabsContent value="dns-providers">
            <DataTable columns={providerColumns} data={page.props.dnsProviders.data} />
          </TabsContent>
        </Tabs>
      </Container>
    </AdminLayout>
  );
}
