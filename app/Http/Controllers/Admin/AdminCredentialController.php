<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\AdminDatabaseUserResource;
use App\Http\Resources\Admin\AdminProviderResource;
use App\Http\Resources\Admin\AdminServerCredentialResource;
use App\Models\DatabaseUser;
use App\Models\DNSProvider;
use App\Models\Server;
use App\Models\ServerProvider;
use App\Models\SourceControl;
use App\Models\StorageProvider;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\RouteAttributes\Attributes\Get;
use Spatie\RouteAttributes\Attributes\Middleware;
use Spatie\RouteAttributes\Attributes\Prefix;

#[Prefix('admin/credentials')]
#[Middleware(['auth', 'must-be-admin:credentials'])]
class AdminCredentialController extends Controller
{
    #[Get('/', name: 'admin.credentials')]
    public function index(): Response
    {
        return Inertia::render('admin/credentials', [
            'databaseUsers' => AdminDatabaseUserResource::collection(
                DatabaseUser::query()->with('server')->get()
            ),
            'servers' => AdminServerCredentialResource::collection(
                Server::query()->with('project')->get()
            ),
            'serverProviders' => AdminProviderResource::collection(
                ServerProvider::all()
            ),
            'sourceControls' => AdminProviderResource::collection(
                SourceControl::all()
            ),
            'storageProviders' => AdminProviderResource::collection(
                StorageProvider::all()
            ),
            'dnsProviders' => AdminProviderResource::collection(
                DNSProvider::all()
            ),
        ]);
    }
}
