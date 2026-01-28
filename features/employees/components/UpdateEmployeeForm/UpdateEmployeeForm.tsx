'use client';

import { Button, NativeSelect, PasswordInput, TextInput, Checkbox } from '@mantine/core';
import { useForm, isEmail } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { IconEyeCheck, IconEyeOff } from '@tabler/icons-react';
import { useState } from 'react';
import { Employee } from '../../types';

type UpdateEmployeeFormProps = {
  employee: Employee;
  onSubmit: (values: {
    username: string;
    email: string;
    password: string | null;
    role: string;
  }) => Promise<void>;
  isLoading?: boolean;
};

export default function UpdateEmployeeForm({ employee, onSubmit, isLoading }: UpdateEmployeeFormProps) {
  const [changePassword, setChangePassword] = useState(false);

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      username: employee.username,
      email: employee.email,
      password: null as string | null,
      role: employee.role.replace('ROLE_', ''),
    },
    validate: {
      email: isEmail('Invalid email address'),
    },
    validateInputOnChange: true,
  });

  const [visible, { toggle }] = useDisclosure(false);

  const VisibilityToggleIcon = ({ reveal }: { reveal: boolean }) =>
    reveal ? (
      <IconEyeOff style={{ width: 'var(--psi-icon-size)', height: 'var(--psi-icon-size)' }} />
    ) : (
      <IconEyeCheck style={{ width: 'var(--psi-icon-size)', height: 'var(--psi-icon-size)' }} />
    );

  const handleSubmit = async (values: typeof form.values) => {
    await onSubmit({
      ...values,
      password: changePassword ? values.password : null,
    });
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <TextInput
        disabled
        label="Username"
        required
        key={form.key('username')}
        {...form.getInputProps('username')}
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
      <Checkbox
        label="Change password"
        checked={changePassword}
        onChange={(e) => setChangePassword(e.currentTarget.checked)}
        mt="md"
      />
      {changePassword && (
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
      )}
      <Button type="submit" fullWidth mt="xl" size="md" radius="md" loading={isLoading}>
        Update
      </Button>
    </form>
  );
}
