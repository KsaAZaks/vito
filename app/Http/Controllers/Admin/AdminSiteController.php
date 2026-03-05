<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\SiteResource;
use App\Models\Site;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\RouteAttributes\Attributes\Get;
use Spatie\RouteAttributes\Attributes\Middleware;
use Spatie\RouteAttributes\Attributes\Prefix;

#[Prefix('admin/sites')]
#[Middleware(['auth', 'must-be-admin:sites'])]
class AdminSiteController extends Controller
{
    #[Get('/', name: 'admin.sites')]
    public function index(): Response
    {
        return Inertia::render('admin/sites', [
            'sites' => SiteResource::collection(
                Site::query()
                    ->with(['server.project'])
                    ->latest()
                    ->simplePaginate(config('web.pagination_size'))
            ),
        ]);
    }
}
