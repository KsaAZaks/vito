<?php

namespace App\Actions\Clickhouse;

use App\Enums\DatabaseStatus;
use App\Models\Database;
use App\Models\Server;
use App\Models\Service;
use App\Services\Clickhouse\Clickhouse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class CreateClickhouseDatabase
{
    /**
     * @param  array<string, mixed>  $input
     */
    public function create(Server $server, array $input): Database
    {
        $this->validate($server, $input);

        /** @var Service $service */
        $service = $server->clickhouse();

        /** @var Clickhouse $handler */
        $handler = $service->handler();
        $handler->createDatabase($input['name']);

        $database = new Database([
            'server_id' => $server->id,
            'service_id' => $service->id,
            'name' => $input['name'],
            'status' => DatabaseStatus::READY,
        ]);
        $database->save();

        return $database;
    }

    private function validate(Server $server, array $input): void
    {
        Validator::make($input, [
            'name' => [
                'required',
                'alpha_dash',
                Rule::unique('databases', 'name')->where('server_id', $server->id)->whereNull('deleted_at'),
            ],
        ])->validate();
    }
}
