<?php

namespace App\Actions\Clickhouse;

use App\Enums\DatabaseUserStatus;
use App\Models\DatabaseUser;
use App\Models\Server;
use App\Models\Service;
use App\Services\Clickhouse\Clickhouse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class CreateClickhouseUser
{
    /**
     * @param  array<string, mixed>  $input
     */
    public function create(Server $server, array $input): DatabaseUser
    {
        $this->validate($server, $input);

        /** @var Service $service */
        $service = $server->clickhouse();

        /** @var Clickhouse $handler */
        $handler = $service->handler();
        $handler->createUser($input['username'], $input['password']);

        $databaseUser = new DatabaseUser([
            'server_id' => $server->id,
            'service_id' => $service->id,
            'username' => $input['username'],
            'password' => $input['password'],
            'host' => 'localhost',
            'status' => DatabaseUserStatus::READY,
        ]);
        $databaseUser->save();

        return $databaseUser;
    }

    private function validate(Server $server, array $input): void
    {
        Validator::make($input, [
            'username' => [
                'required',
                'alpha_dash',
                Rule::unique('database_users', 'username')->where('server_id', $server->id),
            ],
            'password' => [
                'required',
                'min:6',
            ],
        ])->validate();
    }
}
