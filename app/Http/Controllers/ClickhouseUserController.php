<?php

namespace App\Http\Controllers;

use App\Actions\Clickhouse\CreateClickhouseUser;
use App\Actions\Clickhouse\DeleteClickhouseUser;
use App\Http\Resources\DatabaseUserResource;
use App\Models\DatabaseUser;
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

#[Prefix('servers/{server}/clickhouse/users')]
#[Middleware(['auth', 'has-project'])]
class ClickhouseUserController extends Controller
{
    #[Get('/', name: 'clickhouse-users')]
    public function index(Server $server): Response
    {
        $this->authorizeClickhouse('viewAny', $server);

        $service = $server->clickhouse();
        $users = $server->databaseUsers()
            ->where('service_id', $service?->id)
            ->simplePaginate(config('web.pagination_size'));

        return Inertia::render('clickhouse-users/index', [
            'databaseUsers' => DatabaseUserResource::collection($users),
        ]);
    }

    #[Post('/', name: 'clickhouse-users.store')]
    public function store(Request $request, Server $server): RedirectResponse
    {
        $this->authorizeClickhouse('create', $server);

        app(CreateClickhouseUser::class)->create($server, $request->all());

        return back()->with('success', 'ClickHouse user created successfully.');
    }

    #[Delete('/{databaseUser}', name: 'clickhouse-users.destroy')]
    public function destroy(Server $server, DatabaseUser $databaseUser): RedirectResponse
    {
        $this->authorizeClickhouse('delete', $server);

        app(DeleteClickhouseUser::class)->delete($server, $databaseUser);

        return back()->with('success', 'ClickHouse user deleted successfully.');
    }

    private function authorizeClickhouse(string $ability, Server $server): void
    {
        $policy = new ClickhousePolicy;
        abort_unless($policy->$ability(user(), $server), 403);
    }
}
