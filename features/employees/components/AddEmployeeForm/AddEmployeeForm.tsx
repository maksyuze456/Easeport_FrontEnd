'use client';

import { Button, NativeSelect, PasswordInput, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { IconEyeCheck, IconEyeOff } from '@tabler/icons-react';

type AddEmployeeFormProps = {
  onSubmit: (values: {
    username: string;
    email: string;
    password: string;
    role: string;
  }) => Promise<void>;
  isLoading?: boolean;
};

export default function AddEmployeeForm({ onSubmit, isLoading }: AddEmployeeFormProps) {
  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      username: '',
      email: '',
      password: '',
      role: 'USER',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
    },
  });

  const [visible, { toggle }] = useDisclosure(false);

  const VisibilityToggleIcon = ({ reveal }: { reveal: boolean }) =>
    reveal ? (
      <IconEyeOff style={{ width: 'var(--psi-icon-size)', height: 'var(--psi-icon-size)' }} />
    ) : (
      <IconEyeCheck style={{ width: 'var(--psi-icon-size)', height: 'var(--psi-icon-size)' }} />
    );

  const handleSubmit = async (values: typeof form.values) => {
    await onSubmit(values);
    form.reset();
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <TextInput
        label="Username"
        required
        placeholder="Employee username"
        key={form.key('username')}
        {...form.getInputProps('username')}
      />
      <PasswordInput
        label="Password"
        placeholder="******"
        required
        visible={visible}
        onVisibilityChange={toggle}
        visibilityToggleIcon={VisibilityToggleIcon}
        key={form.key('password')}
        {...form.getInputProps('password')}
      />
      <TextInput
        label="Email"
        required
        placeholder="employee@email.com"
        key={form.key('email')}
        {...form.getInputProps('email')}
      />
      <NativeSelect
        required
        label="Role"
        data={['USER', 'ADMIN']}
        key={form.key('role')}
        {...form.getInputProps('role')}
      />
      <Button type="submit" fullWidth mt="xl" size="md" radius="md" loading={isLoading}>
        Create
      </Button>
    </form>
  );
}
