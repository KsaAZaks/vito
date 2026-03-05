<?php

namespace App\Actions\Clickhouse;

use App\Models\DatabaseUser;
use App\Models\Server;
use App\Models\Service;
use App\Services\Clickhouse\Clickhouse;

class DeleteClickhouseUser
{
    public function delete(Server $server, DatabaseUser $databaseUser): void
    {
        /** @var Service $service */
        $service = $server->clickhouse();

        /** @var Clickhouse $handler */
        $handler = $service->handler();
        $handler->deleteUser($databaseUser->username);

        $databaseUser->delete();
    }
}
