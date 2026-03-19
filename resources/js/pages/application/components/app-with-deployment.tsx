import { Head, useForm, usePage } from '@inertiajs/react';
import { Site } from '@/types/site';
import ServerLayout from '@/layouts/server/layout';
import { Server } from '@/types/server';
import Container from '@/components/container';
import HeaderContainer from '@/components/header-container';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BookOpenIcon, LoaderCircleIcon, MoreHorizontalIcon, RefreshCwIcon, RocketIcon, TriangleAlert } from 'lucide-react';
import { PaginatedData } from '@/types';
import { Deployment } from '@/types/deployment';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import DeploymentScript from '@/pages/application/components/deployment-script';
import Env from '@/pages/application/components/env';
import Deploy from '@/pages/application/components/deploy';
import { DataTable } from '@/components/data-table';
import { columns } from '@/pages/application/components/deployment-columns';
import AutoDeployment from '@/pages/application/components/auto-deployment';
import { DeploymentScript as DeploymentScriptType } from '@/types/deployment-script';

export default function AppWithDeployment() {
  const page = usePage<{
    server: Server;
    site: Site;
    deployments: PaginatedData<Deployment>;
    deploymentScript: DeploymentScriptType;
    buildScript?: DeploymentScriptType;
    preFlightScript?: DeploymentScriptType;
  }>();
  const retryForm = useForm();
  const isInstallationFailed = page.props.site.status === 'installation_failed';

  const retryInstallation = () => {
    retryForm.post(
      route('application.retry-installation', { server: page.props.site.server_id, site: page.props.site.id })
    );
  };

  return (
    <ServerLayout>
      <Head title={`${page.props.site.domain} - ${page.props.server.name}`} />

      <Container className="max-w-5xl">
        {isInstallationFailed && (
          <Alert variant="destructive" className="mb-4">
            <TriangleAlert className="size-4" />
            <AlertDescription>
              Site installation failed. You can fix the issue (e.g. add .env.example to the repo) and then Retry
              installation, or run Deploy to run the deployment script.
            </AlertDescription>
          </Alert>
        )}
        <HeaderContainer>
          <Heading title="Application" description="Here you can manage the deployed application" />
          <div className="flex items-center gap-2">
            <a href="https://vitodeploy.com/docs/sites/application" target="_blank">
              <Button variant="outline">
                <BookOpenIcon />
                <span className="hidden lg:block">Docs</span>
              </Button>
            </a>
            {isInstallationFailed && (
              <Button
                variant="outline"
                onClick={retryInstallation}
                disabled={retryForm.processing}
              >
                {retryForm.processing && <LoaderCircleIcon className="size-4 animate-spin" />}
                <RefreshCwIcon />
                <span className="hidden lg:block">Retry installation</span>
              </Button>
            )}
            <Deploy site={page.props.site}>
              <Button>
                <RocketIcon />
                <span className="hidden lg:block">Deploy</span>
              </Button>
            </Deploy>
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontalIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <AutoDeployment site={page.props.site}>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} disabled={!page.props.site.source_control_id}>
                    {page.props.site.auto_deploy ? 'Disable' : 'Enable'} auto deploy
                  </DropdownMenuItem>
                </AutoDeployment>
                {!page.props.site.modern_deployment && (
                  <DeploymentScript
                    site={page.props.site}
                    script={page.props.deploymentScript}
                    description="This script will be executed on every deployment."
                  >
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Deployment Script</DropdownMenuItem>
                  </DeploymentScript>
                )}
                {page.props.buildScript && page.props.site.modern_deployment && (
                  <DeploymentScript
                    site={page.props.site}
                    script={page.props.buildScript}
                    description="This script will build resources like composer and npm before release"
                  >
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Build Script</DropdownMenuItem>
                  </DeploymentScript>
                )}
                {page.props.preFlightScript && page.props.site.modern_deployment && (
                  <DeploymentScript
                    site={page.props.site}
                    script={page.props.preFlightScript}
                    description="This script will be executed before releaase like migrations and optimizations"
                  >
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Pre Flight Script</DropdownMenuItem>
                  </DeploymentScript>
                )}
                <Env site={page.props.site}>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Update .env</DropdownMenuItem>
                </Env>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </HeaderContainer>

        <DataTable columns={columns} paginatedData={page.props.deployments} />
      </Container>
    </ServerLayout>
  );
}
