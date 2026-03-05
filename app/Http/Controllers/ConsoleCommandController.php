<?php

namespace App\Http\Controllers;

use App\Actions\Site\RunConsoleCommand;
use App\Http\Resources\ConsoleCommandResource;
use App\Models\ConsoleCommand;
use App\Models\Server;
use App\Models\Site;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\RouteAttributes\Attributes\Delete;
use Spatie\RouteAttributes\Attributes\Get;
use Spatie\RouteAttributes\Attributes\Middleware;
use Spatie\RouteAttributes\Attributes\Post;
use Spatie\RouteAttributes\Attributes\Prefix;

#[Prefix('/servers/{server}/sites/{site}/console')]
#[Middleware(['auth', 'has-project'])]
class ConsoleCommandController extends Controller
{
    #[Get('/', name: 'site-console')]
    public function index(Server $server, Site $site): Response
    {
        $this->authorize('viewAny', [ConsoleCommand::class, $site, $server]);

        return Inertia::render('console/index', [
            'consoleCommands' => ConsoleCommandResource::collection(
                $site->consoleCommands()->with(['user', 'serverLog'])->latest()->simplePaginate(config('web.pagination_size'))
            ),
        ]);
    }

    #[Post('/', name: 'site-console.run')]
    public function run(Request $request, Server $server, Site $site): RedirectResponse
    {
        $this->authorize('create', [ConsoleCommand::class, $site, $server]);

        app(RunConsoleCommand::class)->run($site, user(), $request->input());

        return back()
            ->with('info', 'Command is being executed.');
    }

    #[Get('/{consoleCommand}', name: 'site-console.show')]
    public function show(Server $server, Site $site, ConsoleCommand $consoleCommand): Response
    {
        $this->authorize('view', [$consoleCommand, $site, $server]);

        $consoleCommand->load(['user', 'serverLog']);

        return Inertia::render('console/show', [
            'consoleCommand' => new ConsoleCommandResource($consoleCommand),
        ]);
    }

    #[Post('/{consoleCommand}/rerun', name: 'site-console.rerun')]
    public function rerun(Server $server, Site $site, ConsoleCommand $consoleCommand): RedirectResponse
    {
        $this->authorize('create', [ConsoleCommand::class, $site, $server]);

        app(RunConsoleCommand::class)->run($site, user(), [
            'command' => $consoleCommand->command,
        ]);

        return back()
            ->with('info', 'Command is being executed.');
    }

    #[Delete('/{consoleCommand}', name: 'site-console.destroy')]
    public function destroy(Server $server, Site $site, ConsoleCommand $consoleCommand): RedirectResponse
    {
        $this->authorize('delete', [$consoleCommand, $site, $server]);

        if ($consoleCommand->serverLog) {
            $consoleCommand->serverLog->delete();
        }

        $consoleCommand->delete();

        return back()
            ->with('success', 'Command deleted successfully.');
    }
}
