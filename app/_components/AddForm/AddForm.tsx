'use client';

import { Button, NativeSelect, PasswordInput, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { IconEyeCheck, IconEyeOff } from '@tabler/icons-react';



export default function AddForm( {onUserAdded} :  { onUserAdded?: () => void } ) {
    const form = useForm({
        mode: 'uncontrolled',
        initialValues: {
            username: '',
            email: '',
            password: '',
            role: 'USER'
        },
        validate: {
            email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
        }
    });
    const [visible, { toggle }] = useDisclosure(false);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';


    const VisibilityToggleIcon = ({ reveal }: { reveal: boolean }) =>
        reveal ? (
            <IconEyeOff style={{ width: 'var(--psi-icon-size)', height: 'var(--psi-icon-size)' }} />
        ) : (
            <IconEyeCheck style={{ width: 'var(--psi-icon-size)', height: 'var(--psi-icon-size)' }} />
    );
    const handleSubmit = async (e : React.FormEvent) => {
        e.preventDefault();
        try {
            const values = form.getValues();
            const res = await fetch(`${apiUrl}/api/admin/users`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify(values)
            });
            if (!res.ok) {
                throw new Error("Failed to create user");
            }
            if (res.ok) {
                const data = await res.json();
                console.log("Created user: " + data);
                form.reset();
                if(onUserAdded) onUserAdded();
            }

        } catch(err) {

        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <TextInput
                label = "Username"
                required
                placeholder='Employee username'
                key={form.key('username')}
                {...form.getInputProps('username')}
            />
            <PasswordInput
                label = "Password"
                placeholder='******'
                required
                visible={visible}
                onVisibilityChange={toggle}
                visibilityToggleIcon={VisibilityToggleIcon}
                key={form.key('password')}
                {...form.getInputProps('password')}
            />
            <TextInput
                label = "Email"
                required
                placeholder='employee@email.com'
                key={form.key('email')}
                {...form.getInputProps('email')}
            />
            <NativeSelect
                required
                label = "Role"
                data={['USER', 'ADMIN']}
                key={form.key('role')}
                {...form.getInputProps('role')}
            />
            <Button type="submit" fullWidth mt="xl" size="md" radius="md">
            Create
            </Button>

        </form>
    )


}