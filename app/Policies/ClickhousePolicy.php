<?php

namespace App\Policies;

use App\Models\Server;
use App\Models\User;
use App\Traits\HasRolePolicies;
use Illuminate\Auth\Access\HandlesAuthorization;

class ClickhousePolicy
{
    use HandlesAuthorization;
    use HasRolePolicies;

    public function viewAny(User $user, Server $server): bool
    {
        return $this->hasReadAccess($user, $server->project)
            && $server->isReady()
            && $server->clickhouse();
    }

    public function create(User $user, Server $server): bool
    {
        return $this->hasWriteAccess($user, $server->project)
            && $server->isReady()
            && $server->clickhouse();
    }

    public function delete(User $user, Server $server): bool
    {
        return $this->hasWriteAccess($user, $server->project)
            && $server->isReady()
            && $server->clickhouse();
    }
}
