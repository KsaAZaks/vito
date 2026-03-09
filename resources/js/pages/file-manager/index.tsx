import { Head, usePage } from '@inertiajs/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useState } from 'react';
import { Server } from '@/types/server';
import { Site } from '@/types/site';
import ServerLayout from '@/layouts/server/layout';
import Container from '@/components/container';
import HeaderContainer from '@/components/header-container';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { FileIcon, FilePlusIcon, FolderOpenIcon, FolderPlusIcon, RefreshCwIcon, UploadIcon } from 'lucide-react';
import BreadcrumbNav from './components/breadcrumb-nav';
import FileTable from './components/file-table';
import CreateDialog from './components/create-dialog';
import UploadDialog from './components/upload-dialog';
import { FileEntry } from './types';

export default function FileManager() {
  const page = usePage<{
    server: Server;
    site?: Site;
    initialPath: string;
  }>();

  const server = page.props.server;
  const site = page.props.site ?? null;
  const [currentPath, setCurrentPath] = useState(page.props.initialPath);
  const [createType, setCreateType] = useState<'file' | 'directory' | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const queryClient = useQueryClient();

  const query = useQuery<{ path: string; files: FileEntry[] }>({
    queryKey: ['file-manager', server.id, currentPath, site?.id],
    queryFn: async () => {
      const params: Record<string, string> = { path: currentPath };
      if (site) params.site = String(site.id);
      const response = await axios.get(route('file-manager.list', { server: server.id }), { params });
      return response.data;
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['file-manager', server.id, currentPath, site?.id] });
  };

  const navigateTo = (path: string) => {
    setCurrentPath(path);
  };

  const handleDirectoryClick = (entry: FileEntry) => {
    const newPath = currentPath.replace(/\/$/, '') + '/' + entry.name;
    navigateTo(newPath);
  };

  return (
    <ServerLayout>
      <Head title={`File Manager - ${server.name}`} />

      <Container className="max-w-6xl">
        <HeaderContainer>
          <Heading title="File Manager" description="Browse and manage files on your server" />
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setCreateType('file')}>
              <FilePlusIcon />
              <span className="hidden lg:block">New File</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCreateType('directory')}>
              <FolderPlusIcon />
              <span className="hidden lg:block">New Folder</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => setUploadOpen(true)}>
              <UploadIcon />
              <span className="hidden lg:block">Upload</span>
            </Button>
            <Button variant="outline" size="icon" onClick={refresh} disabled={query.isFetching}>
              <RefreshCwIcon className={query.isFetching ? 'animate-spin' : ''} />
            </Button>
          </div>
        </HeaderContainer>

        <BreadcrumbNav path={currentPath} onNavigate={navigateTo} site={site} />

        <FileTable
          files={query.data?.files ?? []}
          loading={query.isLoading}
          currentPath={currentPath}
          server={server}
          site={site}
          onDirectoryClick={handleDirectoryClick}
          onRefresh={refresh}
        />

        <CreateDialog
          type={createType}
          currentPath={currentPath}
          server={server}
          site={site}
          onClose={() => setCreateType(null)}
          onSuccess={refresh}
        />

        <UploadDialog
          open={uploadOpen}
          currentPath={currentPath}
          server={server}
          site={site}
          onClose={() => setUploadOpen(false)}
          onSuccess={refresh}
        />
      </Container>
    </ServerLayout>
  );
}
