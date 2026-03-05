<?php

namespace App\Http\Resources;

use App\Models\ConsoleCommand;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin ConsoleCommand */
class ConsoleCommandResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'site_id' => $this->site_id,
            'server_id' => $this->server_id,
            'user_id' => $this->user_id,
            'user' => $this->user?->name,
            'command' => $this->command,
            'server_log_id' => $this->server_log_id,
            'log' => $this->serverLog ? ServerLogResource::make($this->serverLog) : null,
            'status' => $this->status->getText(),
            'status_color' => $this->status->getColor(),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
