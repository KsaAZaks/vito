import { Head, useForm, usePage } from '@inertiajs/react';
import { Server } from '@/types/server';
import { Site } from '@/types/site';
import Container from '@/components/container';
import Heading from '@/components/heading';
import ServerLayout from '@/layouts/server/layout';
import { Button } from '@/components/ui/button';
import { BookOpenIcon, CornerDownLeftIcon, LoaderCircleIcon } from 'lucide-react';
import { DataTable } from '@/components/data-table';
import { columns } from '@/pages/console/components/columns';
import { PaginatedData } from '@/types';
import { ConsoleCommand } from '@/types/console-command';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import InputError from '@/components/ui/input-error';
import { FormEvent } from 'react';

type Page = {
  server: Server;
  site: Site;
  consoleCommands: PaginatedData<ConsoleCommand>;
};

export default function Console() {
  const page = usePage<Page>();

  const form = useForm({
    command: '',
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    form.post(route('site-console.run', { server: page.props.server.id, site: page.props.site.id }), {
      preserveScroll: true,
      onSuccess: () => {
        form.reset('command');
      },
    });
  };

  return (
    <ServerLayout>
      <Head title={`Console - ${page.props.site.domain} - ${page.props.server.name}`} />

      <Container className="max-w-5xl">
        <div className="flex items-start justify-between">
          <Heading title="Console" description="Run commands on your server from within the site's root directory" />
          <a href="https://vitodeploy.com/docs/sites/commands" target="_blank">
            <Button variant="outline">
              <BookOpenIcon />
              <span className="hidden lg:block">Docs</span>
            </Button>
          </a>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Run new command</CardTitle>
            <CardDescription>
              Easily execute arbitrary commands on your server. All commands are executed from within the site's root directory. Commands will be executed
              as the <code className="bg-muted rounded px-1.5 py-0.5 text-xs font-medium">{page.props.site.user}</code> user and may run for two minutes
              before timing out.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="flex items-start gap-2 p-4">
              <div className="flex-1">
                <Input
                  placeholder="php artisan about"
                  value={form.data.command}
                  onChange={(e) => form.setData('command', e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      submit(e);
                    }
                  }}
                />
                <InputError message={form.errors.command} />
              </div>
              <Button type="submit" disabled={form.processing || !form.data.command.trim()}>
                {form.processing ? <LoaderCircleIcon className="animate-spin" /> : <CornerDownLeftIcon />}
                Run
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent commands</CardTitle>
          </CardHeader>
          <CardContent>
            {page.props.consoleCommands.data.length === 0 ? (
              <p className="text-muted-foreground p-4 text-center text-sm font-medium">No recent commands</p>
            ) : (
              <DataTable columns={columns} paginatedData={page.props.consoleCommands} />
            )}
          </CardContent>
        </Card>
      </Container>
    </ServerLayout>
  );
}
