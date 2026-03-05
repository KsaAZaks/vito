<?php

namespace App\Http\Controllers;

use App\Actions\Clickhouse\CreateClickhouseDatabase;
use App\Actions\Clickhouse\DeleteClickhouseDatabase;
use App\Http\Resources\DatabaseResource;
use App\Models\Database;
use App\Models\Server;
use App\Policies\ClickhousePolicy;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\RouteAttributes\Attributes\Delete;
use Spatie\RouteAttributes\Attributes\Get;
use Spatie\RouteAttributes\Attributes\Middleware;
use Spatie\RouteAttributes\Attributes\Post;
use Spatie\RouteAttributes\Attributes\Prefix;

#[Prefix('servers/{server}/clickhouse')]
#[Middleware(['auth', 'has-project'])]
class ClickhouseDatabaseController extends Controller
{
    #[Get('/', name: 'clickhouse-databases')]
    public function index(Server $server): Response
    {
        $this->authorizeClickhouse('viewAny', $server);

        $service = $server->clickhouse();
        $databases = $server->databases()
            ->where('service_id', $service?->id)
            ->simplePaginate(config('web.pagination_size'));

        return Inertia::render('clickhouse/index', [
            'databases' => DatabaseResource::collection($databases),
        ]);
    }

    #[Post('/', name: 'clickhouse-databases.store')]
    public function store(Request $request, Server $server): RedirectResponse
    {
        $this->authorizeClickhouse('create', $server);

        app(CreateClickhouseDatabase::class)->create($server, $request->all());

        return back()->with('success', 'ClickHouse database created successfully.');
    }

    #[Delete('/{database}', name: 'clickhouse-databases.destroy')]
    public function destroy(Server $server, Database $database): RedirectResponse
    {
        $this->authorizeClickhouse('delete', $server);

        app(DeleteClickhouseDatabase::class)->delete($server, $database);

        return back()->with('success', 'ClickHouse database deleted successfully.');
    }

    private function authorizeClickhouse(string $ability, Server $server): void
    {
        $policy = new ClickhousePolicy;
        abort_unless($policy->$ability(user(), $server), 403);
    }
}
