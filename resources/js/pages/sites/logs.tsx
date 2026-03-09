import { Head, useForm, usePage } from '@inertiajs/react';
import { Site } from '@/types/site';
import ServerLayout from '@/layouts/server/layout';
import { Server } from '@/types/server';
import Container from '@/components/container';
import HeaderContainer from '@/components/header-container';
import Heading from '@/components/heading';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { DownloadIcon, LoaderCircleIcon, MoreVerticalIcon, RefreshCwIcon, Trash2Icon } from 'lucide-react';
import LogOutput from '@/components/log-output';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useState } from 'react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type LogType = 'site' | 'nginx-access' | 'nginx-error';

type Page = {
  server: Server;
  site: Site;
  hasSiteLog: boolean;
};

const logTypeLabels: Record<LogType, string> = {
  site: 'Site Log',
  'nginx-access': 'Nginx Access Log',
  'nginx-error': 'Nginx Error Log',
};

export default function SiteLogs() {
  const page = usePage<Page>();
  const { server, site, hasSiteLog } = page.props;

  const availableTypes: LogType[] = [];
  if (hasSiteLog) {
    availableTypes.push('site');
  }
  availableTypes.push('nginx-access', 'nginx-error');

  const [logType, setLogType] = useState<LogType>(availableTypes[0]);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['site-log', server.id, site.id, logType],
    queryFn: async () => {
      try {
        const response = await axios.get(route('sites.logs.show', { server: server.id, site: site.id, type: logType }));
        return typeof response.data === 'string' ? response.data : JSON.stringify(response.data, null, 2);
      } catch {
        return '=== Empty log file ===';
      }
    },
    retry: false,
    refetchInterval: (query) => {
      if (query.state.status === 'error') return false;
      return 5000;
    },
  });

  const clearForm = useForm();

  const handleClear = () => {
    clearForm.post(route('sites.logs.clear', { server: server.id, site: site.id, type: logType }), {
      onSuccess: () => {
        setClearDialogOpen(false);
        queryClient.invalidateQueries({ queryKey: ['site-log', server.id, site.id, logType] });
      },
    });
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['site-log', server.id, site.id, logType] });
  };

  return (
    <ServerLayout>
      <Head title={`${site.domain} - ${server.name}`} />

      <Container className="max-w-5xl">
        <HeaderContainer>
          <Heading title="Logs" description="View your site's log files" />
          <div className="flex items-center gap-2">
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreVerticalIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <a href={route('sites.logs.download', { server: server.id, site: site.id, type: logType })} target="_blank">
                  <DropdownMenuItem>
                    <DownloadIcon className="mr-2 h-4 w-4" />
                    Download
                  </DropdownMenuItem>
                </a>
                <DropdownMenuItem onClick={() => setClearDialogOpen(true)}>
                  <Trash2Icon className="mr-2 h-4 w-4" />
                  Delete contents
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="outline" size="icon" onClick={handleRefresh} disabled={query.isFetching}>
              <RefreshCwIcon className={query.isFetching ? 'animate-spin' : ''} />
            </Button>

            <Select value={logType} onValueChange={(val) => setLogType(val as LogType)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {logTypeLabels[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </HeaderContainer>

        <LogOutput>
          <>
            {query.isLoading && 'Loading...'}
            {query.isError && <div className="text-red-500">Error: {query.error.message}</div>}
            {query.data && !query.isError && query.data}
          </>
        </LogOutput>
      </Container>

      <Dialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear {logTypeLabels[logType]}</DialogTitle>
            <DialogDescription className="sr-only">Clear log contents</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 p-4">
            <p>
              Are you sure you want to clear the contents of <strong>{logTypeLabels[logType]}</strong>?
            </p>
            <p className="text-muted-foreground text-sm">This will remove all content from the log file but keep the file itself.</p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button disabled={clearForm.processing} onClick={handleClear}>
              {clearForm.processing && <LoaderCircleIcon className="animate-spin" />}
              Clear
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ServerLayout>
  );
}
