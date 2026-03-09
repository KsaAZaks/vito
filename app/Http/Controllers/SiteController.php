<?php

namespace App\Http\Controllers;

use App\Actions\Site\CreateSite;
use App\Actions\Site\GetSites;
use App\Helpers\QueryBuilder;
use App\Http\Resources\SiteResource;
use App\Models\Server;
use App\Models\Site;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\RouteAttributes\Attributes\Get;
use Spatie\RouteAttributes\Attributes\Middleware;
use Spatie\RouteAttributes\Attributes\Post;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Throwable;

#[Middleware(['auth', 'has-project'])]
class SiteController extends Controller
{
    #[Get('/sites', name: 'sites.all')]
    public function index(): Response
    {
        $this->authorize('viewAny', user()->currentProject);

        $sites = user()->currentProject->sites()->with('server')->latest();

        $sites = QueryBuilder::for($sites)
            ->searchableFields(['domain'])
            ->query()
            ->simplePaginate(config('web.pagination_size'), pageName: 'sitesPage');

        return Inertia::render('sites/index', [
            'sites' => SiteResource::collection($sites),
        ]);
    }

    #[Get('/servers/{server}/sites', name: 'sites')]
    public function server(Server $server): Response
    {
        $this->authorize('viewAny', [Site::class, $server]);

        $sites = $server->sites()->latest();
        $sites = QueryBuilder::for($sites)
            ->searchableFields(['domain'])
            ->query()
            ->simplePaginate(config('web.pagination_size'), pageName: 'sitesPage');

        return Inertia::render('sites/index', [
            'sites' => SiteResource::collection($sites),
        ]);
    }

    #[Get('/servers/{server}/sites-json', name: 'sites.json')]
    public function json(Request $request, Server $server): ResourceCollection
    {
        $this->authorize('viewAny', [Site::class, $server]);

        $sites = app(GetSites::class)->get($server, $request->input(), 10);

        return SiteResource::collection($sites);
    }

    /**
     * @throws Throwable
     */
    #[Post('/servers/{server}/sites/', name: 'sites.store')]
    public function store(Request $request, Server $server): RedirectResponse
    {
        $this->authorize('create', [Site::class, $server]);

        $site = app(CreateSite::class)->create($server, $request->all());

        return redirect()->route('application', ['server' => $server, 'site' => $site])
            ->with('info', 'Installing site, please wait...');
    }

    #[Post('/servers/{server}/sites/{site}/switch', name: 'sites.switch')]
    public function switch(Server $server, Site $site): RedirectResponse
    {
        $this->authorize('view', [$site, $server]);

        $previousUrl = URL::previous();
        $previousRequest = Request::create($previousUrl);
        $previousRoute = app('router')->getRoutes()->match($previousRequest);

        if ($previousRoute->hasParameter('site')) {
            if (count($previousRoute->parameters()) > 2) {
                return redirect()->route('application', ['server' => $server->id, 'site' => $site->id]);
            }

            return redirect()->route($previousRoute->getName(), ['server' => $server, 'site' => $site->id]);
        }

        return redirect()->route('application', ['server' => $server->id, 'site' => $site->id]);
    }

    #[Get('/servers/{server}/sites/{site}/logs', name: 'sites.logs')]
    public function logs(Server $server, Site $site): Response
    {
        $this->authorize('view', [$site, $server]);

        $hasSiteLog = $site->logs()->where('is_remote', true)->exists();

        return Inertia::render('sites/logs', [
            'hasSiteLog' => $hasSiteLog,
        ]);
    }

    #[Get('/servers/{server}/sites/{site}/site-logs/{type}', name: 'sites.logs.show')]
    public function showLog(Server $server, Site $site, string $type): string
    {
        $this->authorize('view', [$site, $server]);

        $path = $this->resolveLogPath($site, $type);

        try {
            return $server->os()->tail($path, 500);
        } catch (Throwable) {
            return '=== Empty log file ===';
        }
    }

    /**
     * @throws Throwable
     */
    #[Get('/servers/{server}/sites/{site}/site-logs/{type}/download', name: 'sites.logs.download')]
    public function downloadLog(Server $server, Site $site, string $type): StreamedResponse
    {
        $this->authorize('view', [$site, $server]);

        $path = $this->resolveLogPath($site, $type);

        $tmpName = $server->id.'-'.strtotime('now').'-'.$type.'.log';
        $tmpPath = Storage::disk('local')->path($tmpName);

        $server->ssh()->download($tmpPath, $path);

        dispatch(function () use ($tmpPath): void {
            if (File::exists($tmpPath)) {
                File::delete($tmpPath);
            }
        })
            ->delay(now()->addMinutes(5))
            ->onQueue('default');

        return Storage::disk('local')->download($tmpName, $site->domain.'-'.$type.'.log');
    }

    #[Post('/servers/{server}/sites/{site}/site-logs/{type}/clear', name: 'sites.logs.clear')]
    public function clearLog(Server $server, Site $site, string $type): RedirectResponse
    {
        $this->authorize('view', [$site, $server]);

        $path = $this->resolveLogPath($site, $type);

        try {
            $server->os()->clearFile($path);
        } catch (Throwable) {
            return back()->with('error', 'Failed to clear log file');
        }

        return back()->with('success', 'Log cleared successfully');
    }

    private function resolveLogPath(Site $site, string $type): string
    {
        return match ($type) {
            'site' => $this->getSiteLogPath($site),
            'nginx-access' => '/var/log/nginx/'.$site->domain.'-access.log',
            'nginx-error' => '/var/log/nginx/'.$site->domain.'-error.log',
            default => throw new \Symfony\Component\HttpKernel\Exception\NotFoundHttpException('Invalid log type'),
        };
    }

    private function getSiteLogPath(Site $site): string
    {
        $log = $site->logs()->where('is_remote', true)->first();

        if (! $log) {
            abort(404, 'No site log found');
        }

        return $log->name;
    }
}
