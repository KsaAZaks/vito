<?php

namespace App\Actions\Site;

use App\Exceptions\SSHError;
use App\Models\Site;
use Illuminate\Support\Facades\Validator;

class UpdateEnv
{
    /**
     * @param  array<string, mixed>  $input
     *
     * @throws SSHError
     */
    public function update(Site $site, array $input): void
    {
        Validator::make($input, [
            'env' => ['required', 'string'],
            'path' => ['nullable', 'string'],
            'cache' => ['nullable', 'boolean'],
            'queue' => ['nullable', 'boolean'],
        ])->validate();

        $typeData = $site->type_data ?? [];
        $path = $input['path'] ?? data_get($typeData, 'env_path', $site->path.'/.env');

        $site->server->os()->write(
            $path,
            trim((string) $input['env']),
            $site->user,
        );

        $site->jsonUpdate('type_data', 'env_path', $path);

        $commands = [];

        if (! empty($input['cache'])) {
            $commands[] = 'php artisan config:cache';
        }

        if (! empty($input['queue'])) {
            $commands[] = 'php artisan queue:restart';
        }

        if ($commands !== []) {
            $site->server->os()->runScript(
                path: $site->path,
                script: implode("\n", $commands),
                serverLog: null,
                user: $site->user,
                aliases: $site->environmentAliases(),
            );
        }
    }
}
