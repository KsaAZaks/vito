<?php

namespace App\Actions\Clickhouse;

use App\Models\Database;
use App\Models\DatabaseUser;
use App\Models\Service;
use App\Services\Clickhouse\Clickhouse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class LinkClickhouseUser
{
    /**
     * @param  array<string, mixed>  $input
     *
     * @throws ValidationException
     */
    public function link(DatabaseUser $databaseUser, array $input): DatabaseUser
    {
        $this->validate($databaseUser->server_id, $input);

        if (! isset($input['databases']) || ! is_array($input['databases'])) {
            $input['databases'] = [];
        }

        $dbs = Database::query()
            ->where('server_id', $databaseUser->server_id)
            ->where('service_id', $databaseUser->service_id)
            ->whereIn('name', $input['databases'])
            ->count();

        if (count($input['databases']) !== $dbs) {
            throw ValidationException::withMessages(['databases' => __('Databases not found!')]);
        }

        $databaseUser->databases = $input['databases'];

        /** @var Service $service */
        $service = $databaseUser->server->clickhouse();

        /** @var Clickhouse $handler */
        $handler = $service->handler();

        $handler->unlink($databaseUser->username);

        $handler->link(
            $databaseUser->username,
            $databaseUser->databases,
        );

        $databaseUser->save();
        $databaseUser->refresh();

        return $databaseUser;
    }

    private function validate(int $serverId, array $input): void
    {
        Validator::make($input, [
            'databases.*' => [
                'nullable',
                Rule::exists('databases', 'name')->where('server_id', $serverId),
            ],
        ])->validate();
    }
}
