<?php

namespace App\Models;

use App\Enums\CommandExecutionStatus;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $site_id
 * @property int $server_id
 * @property int $user_id
 * @property string $command
 * @property ?int $server_log_id
 * @property CommandExecutionStatus $status
 * @property Carbon $created_at
 * @property Carbon $updated_at
 * @property Site $site
 * @property Server $server
 * @property ?User $user
 * @property ?ServerLog $serverLog
 */
class ConsoleCommand extends AbstractModel
{
    protected $fillable = [
        'site_id',
        'server_id',
        'user_id',
        'command',
        'server_log_id',
        'status',
    ];

    protected $casts = [
        'site_id' => 'integer',
        'server_id' => 'integer',
        'user_id' => 'integer',
        'server_log_id' => 'integer',
        'status' => CommandExecutionStatus::class,
    ];

    /**
     * @return BelongsTo<Site, covariant $this>
     */
    public function site(): BelongsTo
    {
        return $this->belongsTo(Site::class);
    }

    /**
     * @return BelongsTo<Server, covariant $this>
     */
    public function server(): BelongsTo
    {
        return $this->belongsTo(Server::class);
    }

    /**
     * @return BelongsTo<User, covariant $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo<ServerLog, covariant $this>
     */
    public function serverLog(): BelongsTo
    {
        return $this->belongsTo(ServerLog::class);
    }
}
