<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Database;
use App\Models\DatabaseUser;
use App\Models\Server;
use App\Models\Site;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\RouteAttributes\Attributes\Get;
use Spatie\RouteAttributes\Attributes\Middleware;
use Spatie\RouteAttributes\Attributes\Prefix;

#[Prefix('admin')]
#[Middleware(['auth', 'must-be-admin'])]
class AdminController extends Controller
{
    #[Get('/', name: 'admin')]
    public function index(): RedirectResponse
    {
        return to_route('admin.dashboard');
    }

    #[Get('/dashboard', name: 'admin.dashboard', middleware: ['must-be-admin:dashboard'])]
    public function dashboard(): Response
    {
        return Inertia::render('admin/dashboard', [
            'stats' => [
                'users' => User::count(),
                'servers' => Server::count(),
                'sites' => Site::count(),
                'databases' => Database::count(),
                'database_users' => DatabaseUser::count(),
            ],
        ]);
    }
}
