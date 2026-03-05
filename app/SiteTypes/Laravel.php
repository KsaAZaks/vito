<?php

namespace App\SiteTypes;

use App\Models\ServerLog;
use App\Models\Site;

class Laravel extends PHPSite
{
    public static function id(): string
    {
        return 'laravel';
    }

    public static function make(): self
    {
        return new self(new Site(['type' => self::id()]));
    }

    public function install(): void
    {
        parent::install();

        $this->setupEnvFile();
        $this->progress(85);

        ServerLog::create([
            'server_id' => $this->site->server_id,
            'site_id' => $this->site->id,
            'is_remote' => true,
            'name' => $this->site->path.'/storage/logs/laravel.log',
            'type' => 'remote',
            'disk' => 'ssh',
        ]);
    }

    /**
     * Copy .env.example to .env and generate application key if .env doesn't exist yet.
     */
    private function setupEnvFile(): void
    {
        $ssh = $this->site->server->ssh($this->site->user);
        $path = $this->site->path;

        $ssh->exec(
            "cd {$path} && if [ ! -f .env ] && [ -f .env.example ]; then cp .env.example .env && php artisan key:generate --force; fi",
            'setup-env',
            $this->site->id,
        );
    }

    public function baseCommands(): array
    {
        return array_merge(parent::baseCommands(), [
            [
                'name' => 'cache:clear',
                'command' => 'php artisan cache:clear',
            ],
            [
                'name' => 'down',
                'command' => 'php artisan down --retry=5 --refresh=6 --quiet',
            ],
            [
                'name' => 'up',
                'command' => 'php artisan up',
            ],
        ]);
    }
}
