import { Head, usePage } from '@inertiajs/react';
import { Server } from '@/types/server';
import type { Database } from '@/types/database';
import Container from '@/components/container';
import HeaderContainer from '@/components/header-container';
import Heading from '@/components/heading';
import CreateClickhouseDatabase from '@/pages/clickhouse/components/create-database';
import { Button } from '@/components/ui/button';
import ServerLayout from '@/layouts/server/layout';
import { DataTable } from '@/components/data-table';
import { columns } from '@/pages/clickhouse/components/columns';
import { PlusIcon } from 'lucide-react';
import { PaginatedData } from '@/types';

type Page = {
  server: Server;
  databases: PaginatedData<Database>;
};

export default function ClickhouseDatabases() {
  const page = usePage<Page>();

  return (
    <ServerLayout>
      <Head title={`ClickHouse - ${page.props.server.name}`} />

      <Container className="max-w-5xl">
        <HeaderContainer>
          <Heading title="ClickHouse Databases" description="Here you can manage the ClickHouse databases" />
          <div className="flex items-center gap-2">
            <CreateClickhouseDatabase server={page.props.server.id}>
              <Button>
                <PlusIcon />
                <span className="hidden lg:block">Create</span>
              </Button>
            </CreateClickhouseDatabase>
          </div>
        </HeaderContainer>

        <DataTable columns={columns} paginatedData={page.props.databases} />
      </Container>
    </ServerLayout>
  );
}
