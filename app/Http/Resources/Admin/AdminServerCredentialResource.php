<?php

namespace App\Http\Resources\Admin;

use App\Models\Server;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Server */
class AdminServerCredentialResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'ip' => $this->ip,
            'ssh_user' => $this->ssh_user,
            'port' => $this->port,
            'authentication' => $this->authentication,
            'public_key' => $this->public_key,
            'project_name' => $this->project?->name,
            'created_at' => $this->created_at,
        ];
    }
}
