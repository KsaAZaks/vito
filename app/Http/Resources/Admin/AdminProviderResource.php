<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminProviderResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $data = [
            'id' => $this->id,
            'type' => $this->getMorphClass(),
            'provider' => $this->provider ?? null,
            'created_at' => $this->created_at,
        ];

        if (property_exists($this->resource, 'profile') || isset($this->resource->profile)) {
            $data['profile'] = $this->profile;
        }

        if (property_exists($this->resource, 'name') || isset($this->resource->name)) {
            $data['name'] = $this->name;
        }

        if (property_exists($this->resource, 'credentials')) {
            $data['credentials'] = $this->credentials;
        }

        if (property_exists($this->resource, 'access_token')) {
            $data['access_token'] = $this->makeVisible('access_token')->access_token ?? null;
        }

        if (property_exists($this->resource, 'url')) {
            $data['url'] = $this->url ?? null;
        }

        return $data;
    }
}
