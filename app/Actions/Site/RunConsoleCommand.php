<?php

namespace App\Actions\Site;

use App\Enums\CommandExecutionStatus;
use App\Models\ConsoleCommand;
use App\Models\ServerLog;
use App\Models\Site;
use App\Models\User;
use Illuminate\Support\Facades\Validator;

class RunConsoleCommand
{
    /**
     * @param  array<string, mixed>  $input
     */
    public function run(Site $site, User $user, array $input): ConsoleCommand
    {
        Validator::make($input, [
            'command' => ['required', 'string', 'max:5000'],
        ])->validate();

        $consoleCommand = new ConsoleCommand([
            'site_id' => $site->id,
            'server_id' => $site->server_id,
            'user_id' => $user->id,
            'command' => $input['command'],
            'status' => CommandExecutionStatus::EXECUTING,
        ]);
        $consoleCommand->save();

        $log = ServerLog::newLog($site->server, 'console-command-'.$consoleCommand->id);
        $log->site_id = $site->id;
        $log->save();

        $consoleCommand->server_log_id = $log->id;
        $consoleCommand->save();

        dispatch(function () use ($consoleCommand, $site, $log): void {
            $site->server->os()->runScript(
                path: $site->path,
                script: $consoleCommand->command,
                serverLog: $log,
                user: $site->user,
                aliases: $site->environmentAliases(),
            );
            $consoleCommand->status = CommandExecutionStatus::COMPLETED;
            $consoleCommand->save();
        })->catch(function () use ($consoleCommand): void {
            $consoleCommand->status = CommandExecutionStatus::FAILED;
            $consoleCommand->save();
        })->onQueue('ssh');

        return $consoleCommand;
    }
}
