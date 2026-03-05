import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { FormEventHandler, ReactNode, useState } from 'react';
import { Button } from '@/components/ui/button';
import { LoaderCircle } from 'lucide-react';
import { useForm, usePage } from '@inertiajs/react';
import { Form, FormField, FormFields } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import InputError from '@/components/ui/input-error';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdminPermission, User } from '@/types/user';
import FormSuccessful from '@/components/form-successful';
import { Checkbox } from '@/components/ui/checkbox';
import { SharedData } from '@/types';

const ALL_PERMISSIONS: { value: AdminPermission; label: string }[] = [
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'users', label: 'Users' },
  { value: 'servers', label: 'Servers' },
  { value: 'sites', label: 'Sites' },
  { value: 'credentials', label: 'Credentials' },
  { value: 'plugins', label: 'Plugins' },
  { value: 'settings', label: 'Settings' },
];

export default function UserForm({ user, children }: { user?: User; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const page = usePage<SharedData>();
  const currentUser = page.props.auth?.user;
  const canManagePermissions = currentUser?.is_super_admin;

  const form = useForm<{
    name: string;
    email: string;
    password: string;
    role: string;
    admin_permissions: AdminPermission[];
  }>({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    role: user?.is_admin ? 'admin' : 'user',
    admin_permissions: user?.admin_permissions || [],
  });

  const togglePermission = (permission: AdminPermission) => {
    const current = form.data.admin_permissions;
    if (current.includes(permission)) {
      form.setData(
        'admin_permissions',
        current.filter((p) => p !== permission),
      );
    } else {
      form.setData('admin_permissions', [...current, permission]);
    }
  };

  const submit: FormEventHandler = (e) => {
    e.preventDefault();

    if (user) {
      form.patch(route('users.update', user.id));
      return;
    }

    form.post(route('users.store'), {
      onSuccess() {
        setOpen(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{user ? `Edit ${user.name}` : 'Create user'}</DialogTitle>
          <DialogDescription className="sr-only">
            {user ? `Fill the form to edit ${user.name}` : 'Fill the form to create a new user'}
          </DialogDescription>
        </DialogHeader>
        <Form id="user-form" onSubmit={submit} className="p-4">
          <FormFields>
            <FormField>
              <Label htmlFor="name">Name</Label>
              <Input type="text" id="name" name="name" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} />
              <InputError message={form.errors.name} />
            </FormField>
            <FormField>
              <Label htmlFor="email">Email</Label>
              <Input type="email" id="email" name="email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} />
              <InputError message={form.errors.email} />
            </FormField>
            <FormField>
              <Label htmlFor="password">Password</Label>
              <Input
                type="password"
                id="password"
                name="password"
                value={form.data.password}
                onChange={(e) => form.setData('password', e.target.value)}
              />
              <InputError message={form.errors.password} />
            </FormField>
            <FormField>
              <Label htmlFor="role">Role</Label>
              <Select value={form.data.role} onValueChange={(value) => form.setData('role', value)}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem key="role-user" value="user">
                      user
                    </SelectItem>
                    <SelectItem key="role-admin" value="admin">
                      admin
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <InputError message={form.errors.role} />
            </FormField>
            {canManagePermissions && (
              <FormField>
                <Label>Admin Permissions</Label>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {ALL_PERMISSIONS.map((perm) => (
                    <label key={perm.value} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={form.data.admin_permissions.includes(perm.value)}
                        onCheckedChange={() => togglePermission(perm.value)}
                      />
                      {perm.label}
                    </label>
                  ))}
                </div>
                <InputError message={form.errors.admin_permissions} />
              </FormField>
            )}
          </FormFields>
        </Form>
        <DialogFooter className="items-center">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button form="user-form" type="button" onClick={submit} disabled={form.processing}>
            {form.processing && <LoaderCircle className="animate-spin" />}
            <FormSuccessful successful={form.recentlySuccessful} />
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
