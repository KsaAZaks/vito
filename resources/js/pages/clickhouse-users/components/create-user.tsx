import { FormEvent, ReactNode, useState } from 'react';
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
import { Form, FormField, FormFields } from '@/components/ui/form';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { LoaderCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import InputError from '@/components/ui/input-error';

type CreateForm = {
  username: string;
  password: string;
};

export default function CreateClickhouseUser({
  server,
  children,
}: {
  server: number;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const form = useForm<CreateForm>({
    username: '',
    password: '',
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    form.post(route('clickhouse-users.store', server), {
      onSuccess: () => {
        form.reset();
        setOpen(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create ClickHouse user</DialogTitle>
          <DialogDescription className="sr-only">Create new ClickHouse user</DialogDescription>
        </DialogHeader>
        <Form className="p-4" id="create-clickhouse-user-form" onSubmit={submit}>
          <FormFields>
            <FormField>
              <Label htmlFor="username">Username</Label>
              <Input
                type="text"
                id="username"
                name="username"
                value={form.data.username}
                onChange={(e) => form.setData('username', e.target.value)}
              />
              <InputError message={form.errors.username} />
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
          </FormFields>
        </Form>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" onClick={submit} disabled={form.processing}>
            {form.processing && <LoaderCircle className="animate-spin" />}
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
