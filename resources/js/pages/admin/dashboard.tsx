import AdminLayout from '@/layouts/admin/layout';
import { Head, usePage } from '@inertiajs/react';
import Container from '@/components/container';
import Heading from '@/components/heading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DatabaseIcon, HardDriveIcon, GlobeIcon, UsersIcon, UserIcon } from 'lucide-react';

type Stats = {
  users: number;
  servers: number;
  sites: number;
  databases: number;
  database_users: number;
};

type Page = {
  stats: Stats;
};

const statCards = [
  { key: 'users' as const, label: 'Users', icon: UsersIcon },
  { key: 'servers' as const, label: 'Servers', icon: HardDriveIcon },
  { key: 'sites' as const, label: 'Sites', icon: GlobeIcon },
  { key: 'databases' as const, label: 'Databases', icon: DatabaseIcon },
  { key: 'database_users' as const, label: 'Database Users', icon: UserIcon },
];

export default function Dashboard() {
  const page = usePage<Page>();
  const stats = page.props.stats;

  return (
    <AdminLayout>
      <Head title="Admin Dashboard" />

      <Container className="max-w-5xl">
        <Heading title="Dashboard" description="Overview of your system" />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {statCards.map((item) => (
            <Card key={item.key}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{item.label}</CardTitle>
                <item.icon className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="text-2xl font-bold">{stats[item.key]}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Container>
    </AdminLayout>
  );
}
