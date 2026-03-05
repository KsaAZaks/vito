<?php

namespace App\Services\Clickhouse;

use App\Exceptions\ServiceInstallationFailed;
use App\Exceptions\SSHError;
use App\Services\AbstractService;

class Clickhouse extends AbstractService
{
    /**
     * @var array<string>
     */
    protected array $systemDbs = ['INFORMATION_SCHEMA', 'default', 'information_schema', 'system'];

    /**
     * @var array<string>
     */
    protected array $systemUsers = ['default'];

    public static function id(): string
    {
        return 'clickhouse';
    }

    public static function type(): string
    {
        return 'clickhouse';
    }

    public function unit(): string
    {
        return 'clickhouse-server';
    }

    protected function getScriptView(string $script): string
    {
        return 'ssh.services.clickhouse.'.$script;
    }

    /**
     * @throws ServiceInstallationFailed
     * @throws SSHError
     */
    public function install(): void
    {
        $version = str_replace('.', '', $this->service->version);
        $command = view($this->getScriptView('install-'.$version));
        $this->service->server->ssh()->exec($command, 'install-clickhouse-'.$version);
        $status = $this->service->server->systemd()->status($this->unit());
        $this->service->validateInstall($status);
        $this->service->server->os()->cleanup();
        event('service.installed', $this->service);
    }

    /**
     * @throws SSHError
     */
    public function uninstall(): void
    {
        $command = view($this->getScriptView('uninstall'));
        $this->service->server->ssh()->exec($command, 'uninstall-clickhouse');
        event('service.uninstalled', $this->service);
        $this->service->server->os()->cleanup();
    }

    /**
     * @throws SSHError
     */
    public function createDatabase(string $name): void
    {
        $this->service->server->ssh()->exec(
            view($this->getScriptView('create-database'), ['name' => $name]),
            'create-clickhouse-database'
        );
    }

    /**
     * @throws SSHError
     */
    public function deleteDatabase(string $name): void
    {
        $this->service->server->ssh()->exec(
            view($this->getScriptView('delete-database'), ['name' => $name]),
            'delete-clickhouse-database'
        );
    }

    /**
     * @throws SSHError
     */
    public function createUser(string $username, string $password): void
    {
        $this->service->server->ssh()->exec(
            view($this->getScriptView('create-user'), [
                'username' => $username,
                'password' => $password,
            ]),
            'create-clickhouse-user'
        );
    }

    /**
     * @throws SSHError
     */
    public function deleteUser(string $username): void
    {
        $this->service->server->ssh()->exec(
            view($this->getScriptView('delete-user'), ['username' => $username]),
            'delete-clickhouse-user'
        );
    }

    /**
     * @return array<array<string>>
     */
    public function getDatabases(): array
    {
        $data = $this->service->server->ssh()->exec(
            view($this->getScriptView('get-db-list')),
            'get-clickhouse-db-list'
        );

        $lines = array_filter(explode("\n", trim($data)));

        return array_values(array_filter(
            array_map(fn ($line) => [trim($line)], $lines),
            fn ($db) => ! in_array($db[0], $this->systemDbs)
        ));
    }

    /**
     * @return array<array<string>>
     */
    public function getUsers(): array
    {
        $data = $this->service->server->ssh()->exec(
            view($this->getScriptView('get-users-list')),
            'get-clickhouse-users-list'
        );

        $lines = array_filter(explode("\n", trim($data)));

        return array_values(array_filter(
            array_map(fn ($line) => [trim($line)], $lines),
            fn ($user) => ! in_array($user[0], $this->systemUsers)
        ));
    }

    public function version(): string
    {
        $version = $this->service->server->ssh()->exec(
            "clickhouse-server --version | grep -oE '[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+' | head -n 1"
        );

        return trim($version);
    }
}
