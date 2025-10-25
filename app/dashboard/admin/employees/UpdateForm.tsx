'use client';

import { Button, NativeSelect, PasswordInput, TextInput, Checkbox } from '@mantine/core';
import { useForm, isEmail,  } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { IconEyeCheck, IconEyeOff } from '@tabler/icons-react';
import { User } from '../../../_context/EmployeeProvider';
import { useState } from 'react';


export default function UpdateForm( {onUserAdded, user} :  { onUserAdded?: () => void, user?: User } ) {
    const [changePassword, setChangePassword] = useState(false);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const form = useForm({
        mode: 'uncontrolled',
        initialValues: {
            username: user?.username,
            email: user?.email,
            password: null,
            role: 'USER'
        },
        validate: {
            email: isEmail('Invalid email address'),
        },
        validateInputOnChange: true
    });

    const [visible, { toggle }] = useDisclosure(false);

    const VisibilityToggleIcon = ({ reveal }: { reveal: boolean }) =>
        reveal ? (
            <IconEyeOff style={{ width: 'var(--psi-icon-size)', height: 'var(--psi-icon-size)' }} />
        ) : (
            <IconEyeCheck style={{ width: 'var(--psi-icon-size)', height: 'var(--psi-icon-size)' }} />
    );
    const handleSubmit = async (values: typeof form.values, e? : React.FormEvent) => {
        e?.preventDefault();
        try {
            const values = form.getValues();
            const res = await fetch(`${apiUrl}/api/admin/users/update`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-type': 'application/json'
                },
                body: JSON.stringify(values)
            });
            if (!res.ok) {
                throw new Error(await res.json());
            }
            if (res.ok) {
                const data = await res.json();
                console.log(data);
                form.reset();
                if(onUserAdded) onUserAdded();
            }

        } catch(err) {

        }
    };

    return (
        <form onSubmit={form.onSubmit(handleSubmit)}>
            <TextInput
                disabled
                label = "Username"
                required
                key={form.key('username')}
                {...form.getInputProps('username')}
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
            <Checkbox
                label="Change password"
                checked={changePassword}
                onChange={(e) => setChangePassword(e.currentTarget.checked)}
                mt="md"
            />
            {changePassword && 
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
            }
            <Button type="submit" fullWidth mt="xl" size="md" radius="md">
            Update
            </Button>

        </form>
    )


}