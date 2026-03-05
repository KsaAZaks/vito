<?php

namespace App\Actions\Clickhouse;

use App\Models\Database;
use App\Models\Server;
use App\Models\Service;
use App\Services\Clickhouse\Clickhouse;

class DeleteClickhouseDatabase
{
    public function delete(Server $server, Database $database): void
    {
        /** @var Service $service */
        $service = $server->clickhouse();

        /** @var Clickhouse $handler */
        $handler = $service->handler();
        $handler->deleteDatabase($database->name);

        $database->delete();
    }
}
