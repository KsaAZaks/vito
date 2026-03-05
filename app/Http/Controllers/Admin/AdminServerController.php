<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ServerResource;
use App\Models\Server;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\RouteAttributes\Attributes\Get;
use Spatie\RouteAttributes\Attributes\Middleware;
use Spatie\RouteAttributes\Attributes\Prefix;

#[Prefix('admin/servers')]
#[Middleware(['auth', 'must-be-admin:servers'])]
class AdminServerController extends Controller
{
    #[Get('/', name: 'admin.servers')]
    public function index(): Response
    {
        return Inertia::render('admin/servers', [
            'servers' => ServerResource::collection(
                Server::query()
                    ->with(['project', 'creator'])
                    ->latest()
                    ->simplePaginate(config('web.pagination_size'))
            ),
        ]);
    }
}
