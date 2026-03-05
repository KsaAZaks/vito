import { Head, Link, usePage } from '@inertiajs/react';
import { Server } from '@/types/server';
import { Site } from '@/types/site';
import Container from '@/components/container';
import Heading from '@/components/heading';
import ServerLayout from '@/layouts/server/layout';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon, RotateCcwIcon, Trash2Icon } from 'lucide-react';
import { ConsoleCommand } from '@/types/console-command';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import DateTime from '@/components/date-time';
import LogOutput from '@/components/log-output';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

type Page = {
  server: Server;
  site: Site;
  consoleCommand: ConsoleCommand;
};

export default function Show() {
  const page = usePage<Page>();
  const cmd = page.props.consoleCommand;

  const logQuery = useQuery({
    queryKey: ['console-command-log', cmd.id],
    queryFn: async () => {
      if (!cmd.log) return null;
      const response = await axios.get(route('logs.show', { server: cmd.server_id, log: cmd.log.id }));
      return typeof response.data === 'string' ? response.data : JSON.stringify(response.data, null, 2);
    },
    enabled: !!cmd.log,
    refetchInterval: (query) => {
      if (query.state.status === 'error') return false;
      if (cmd.status !== 'executing') return false;
      return 2500;
    },
  });

  return (
    <ServerLayout>
      <Head title={`Command details - ${page.props.site.domain} - ${page.props.server.name}`} />

      <Container className="max-w-5xl">
        <div className="flex items-start justify-between">
          <Heading title="Command details" />
          <div className="flex items-center gap-2">
            <Link href={route('console', { server: page.props.server.id, site: page.props.site.id })}>
              <Button variant="outline">
                <ArrowLeftIcon />
                <span className="hidden lg:block">Back to commands</span>
              </Button>
            </Link>
          </div>
        </div>

        <Card>
          <CardContent className="space-y-4 p-4">
            <div>
              <code className="text-muted-foreground block text-sm break-all whitespace-pre-wrap">{cmd.command}</code>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Badge variant={cmd.status_color}>{cmd.status}</Badge>
              {cmd.user && <span className="text-muted-foreground text-sm">{cmd.user}</span>}
              <span className="text-muted-foreground text-sm">
                <DateTime date={cmd.created_at} />
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Command output</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {!cmd.log ? (
              <p className="text-muted-foreground text-center text-sm">
                No output available. Command may not have any output, or output file is missing on the server.
              </p>
            ) : (
              <LogOutput>
                <>
                  {logQuery.isLoading && 'Loading...'}
                  {logQuery.isError && <div className="text-red-500">Error loading log output</div>}
                  {logQuery.data && !logQuery.isError && logQuery.data}
                  {!logQuery.isLoading && !logQuery.isError && !logQuery.data && (
                    <span className="text-muted-foreground">No output available</span>
                  )}
                </>
              </LogOutput>
            )}
          </CardContent>
        </Card>
      </Container>
    </ServerLayout>
  );
}
