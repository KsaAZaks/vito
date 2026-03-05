import { Head, usePage } from '@inertiajs/react';
import { Server } from '@/types/server';
import Container from '@/components/container';
import HeaderContainer from '@/components/header-container';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import ServerLayout from '@/layouts/server/layout';
import { DataTable } from '@/components/data-table';
import { PlusIcon } from 'lucide-react';
import CreateClickhouseUser from '@/pages/clickhouse-users/components/create-user';
import { DatabaseUser } from '@/types/database-user';
import { columns } from '@/pages/clickhouse-users/components/columns';
import { PaginatedData } from '@/types';

type Page = {
  server: Server;
  databaseUsers: PaginatedData<DatabaseUser>;
};

export default function ClickhouseUsers() {
  const page = usePage<Page>();

  return (
    <ServerLayout>
      <Head title={`ClickHouse Users - ${page.props.server.name}`} />

      <Container className="max-w-5xl">
        <HeaderContainer>
          <Heading title="ClickHouse Users" description="Here you can manage the ClickHouse users" />
          <div className="flex items-center gap-2">
            <CreateClickhouseUser server={page.props.server.id}>
              <Button>
                <PlusIcon />
                <span className="hidden lg:block">Create</span>
              </Button>
            </CreateClickhouseUser>
          </div>
        </HeaderContainer>

        <DataTable columns={columns} paginatedData={page.props.databaseUsers} />
      </Container>
    </ServerLayout>
  );
}
