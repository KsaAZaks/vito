<?php

namespace App\Http\Resources\Admin;

use App\Models\DatabaseUser;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin DatabaseUser */
class AdminDatabaseUserResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'server_id' => $this->server_id,
            'server_name' => $this->server?->name,
            'server_ip' => $this->server?->ip,
            'username' => $this->username,
            'password' => $this->makeVisible('password')->password,
            'databases' => $this->databases,
            'host' => $this->host,
            'status' => $this->status->getText(),
            'created_at' => $this->created_at,
        ];
    }
}
