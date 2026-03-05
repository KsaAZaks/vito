import { Head, useForm, usePage } from '@inertiajs/react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Editor, useMonaco } from '@monaco-editor/react';
import { Site } from '@/types/site';
import { Server } from '@/types/server';
import ServerLayout from '@/layouts/server/layout';
import Container from '@/components/container';
import HeaderContainer from '@/components/header-container';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpenIcon, LoaderCircleIcon, RefreshCwIcon } from 'lucide-react';
import { registerDotEnvLanguage } from '@/lib/editor';
import { useAppearance } from '@/hooks/use-appearance';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormEvent } from 'react';

export default function Environment() {
  const { getActualAppearance } = useAppearance();
  const page = usePage<{
    server: Server;
    site: Site;
  }>();

  const site = page.props.site;

  const form = useForm<{
    env: string;
    path: string;
  }>({
    env: '',
    path: site.type_data.env_path || `${site.path}/.env`,
  });

  const query = useQuery({
    queryKey: ['environment.env', site.server_id, site.id, form.data.path],
    queryFn: async () => {
      const response = await axios.get(
        route('application.env', {
          server: site.server_id,
          site: site.id,
          env: form.data.path,
        }),
      );
      if (response.data?.env) {
        form.setData('env', response.data.env);
      }
      return response.data;
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  registerDotEnvLanguage(useMonaco());

  const submit = (e: FormEvent) => {
    e.preventDefault();
    form.put(route('application.update-env', { server: site.server_id, site: site.id }));
  };

  return (
    <ServerLayout>
      <Head title={`Environment - ${site.domain}`} />

      <Container className="max-w-5xl">
        <HeaderContainer>
          <Heading title="Environment" description="Manage your site's environment variables" />
          <div className="flex items-center gap-2">
            <a href="https://vitodeploy.com/docs/sites/application" target="_blank">
              <Button variant="outline">
                <BookOpenIcon />
                <span className="hidden lg:block">Docs</span>
              </Button>
            </a>
          </div>
        </HeaderContainer>

        <Card>
          <CardHeader className="flex-row items-center justify-between gap-2">
            <div className="space-y-2">
              <CardTitle>Environment variables</CardTitle>
              <CardDescription>Your application's environment variables</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => query.refetch()} disabled={query.isFetching}>
                <RefreshCwIcon className={query.isFetching ? 'animate-spin' : ''} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Label htmlFor="env-path">File path</Label>
              <Input
                id="env-path"
                name="path"
                value={form.data.path}
                onChange={(e) => form.setData('path', e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="border-border h-[500px] overflow-hidden rounded-md border">
              {query.isSuccess ? (
                <Editor
                  value={form.data.env}
                  defaultLanguage="dotenv"
                  theme={getActualAppearance() === 'dark' ? 'vs-dark' : 'vs'}
                  className="h-full"
                  onChange={(value) => form.setData('env', value ?? '')}
                  options={{
                    fontSize: 14,
                    minimap: { enabled: false },
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    wordWrap: 'on',
                  }}
                />
              ) : (
                <Skeleton className="h-full w-full rounded-none" />
              )}
            </div>
            <div className="mt-4 flex items-center justify-end">
              <Button onClick={submit} disabled={form.processing || query.isLoading}>
                {form.processing && <LoaderCircleIcon className="animate-spin" />}
                Save
              </Button>
            </div>
          </CardContent>
        </Card>
      </Container>
    </ServerLayout>
  );
}
