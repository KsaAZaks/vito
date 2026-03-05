<?php

namespace App\Actions\User;

use App\Enums\AdminPermission;
use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class UpdateUser
{
    /**
     * @param  array<string, mixed>  $input
     */
    public function update(User $user, array $input): User
    {
        $this->validate($user, $input);

        $user->name = $input['name'];
        $user->email = $input['email'];
        $user->is_admin = $input['role'] === UserRole::ADMIN->value;

        if (isset($input['admin_permissions'])) {
            $user->admin_permissions = $input['admin_permissions'];
        }

        if (isset($input['password'])) {
            $user->password = bcrypt($input['password']);
        }

        $user->save();

        return $user;
    }

    /**
     * @param  array<string, mixed>  $input
     */
    private function validate(User $user, array $input): void
    {
        $validPermissions = array_map(fn (AdminPermission $p) => $p->value, AdminPermission::cases());

        Validator::make($input, [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'email', 'max:255',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
            'role' => [
                'required',
                Rule::in([UserRole::ADMIN, UserRole::USER]),
            ],
            'admin_permissions' => ['nullable', 'array'],
            'admin_permissions.*' => ['string', Rule::in($validPermissions)],
        ])->validate();
    }
}
