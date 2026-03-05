<?php

namespace App\Http\Middleware;

use App\Enums\AdminPermission;
use Closure;
use Illuminate\Http\Request;

class MustBeAdminMiddleware
{
    public function handle(Request $request, Closure $next, ?string $permission = null): mixed
    {
        $user = $request->user();

        if (! $user) {
            abort(404);
        }

        if ($permission) {
            $adminPermission = AdminPermission::tryFrom($permission);
            if (! $adminPermission || ! $user->hasAdminPermission($adminPermission)) {
                abort(404);
            }
        } elseif (! $user->isAdmin()) {
            abort(404);
        }

        return $next($request);
    }
}
