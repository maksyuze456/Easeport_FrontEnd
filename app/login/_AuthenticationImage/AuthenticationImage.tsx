'use client';
import { useState } from 'react';
import {
  Anchor,
  Button,
  Checkbox,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import classes from './AuthenticationImage.module.css';
import { useRouter } from 'next/navigation';

export function AuthenticationImage() {
    const router = useRouter();
    const [IsLoading, setIsLoading] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (IsLoading) return;
        setIsLoading(true);


        try {
            const res = await fetch('http://localhost:8080/api/auth/signin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({username, password}),
                credentials: 'include'
            });
            console.log();
            if (!res.ok) {
                throw new Error('Login failed');
            }
            if(res.ok) {
                const data = await res.json();
                console.log(data);
                router.push('/dashboard');
            };
        } catch (e) {
            console.log(e);
        } finally {
          setIsLoading(false);
        }


    };

  return (
    <div className={classes.wrapper}>
      <Paper className={classes.form}>
        <Title order={2} className={classes.title}>
          Welcome back to Mantine!
        </Title>
        <form onSubmit={handleLogin}>
          <TextInput
            label="Username"
            placeholder="Your username"
            size="md"
            radius="md"
            value={username}
            onChange={(e) => setUsername(e.currentTarget.value)}
          />

          <PasswordInput
            label="Password"
            placeholder="Your password"
            mt="md"
            size="md"
            radius="md"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
          />

          <Checkbox label="Keep me logged in" mt="xl" size="md" />

          <Button
            type="submit"
            fullWidth mt="xl"
            size="md" radius="md"
            loading={IsLoading}
            disabled={IsLoading || !username.trim() || !password.trim()}
            >
            {IsLoading ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        <Text ta="center" mt="md">
          Don&apos;t have an account?{' '}
          <Anchor href="#" fw={500} onClick={(event) => event.preventDefault()}>
            Register
          </Anchor>
        </Text>
      </Paper>
    </div>
  );
}