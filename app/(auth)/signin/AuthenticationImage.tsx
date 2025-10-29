'use client';

import { useState } from 'react';
import {
  Button,
  Checkbox,
  Paper,
  PasswordInput,
  TextInput,
  Title,
} from '@mantine/core';
import classes from './AuthenticationImage.module.css';
import { useRouter } from 'next/navigation';

export default function AuthenticationImage() {
  const router = useRouter();
  const [IsLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (IsLoading) return;
    setIsLoading(true);

    try {
      console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
      console.log('Full URL:', `${process.env.NEXT_PUBLIC_API_URL}/api/auth/signin`);
      const res = await fetch(`${apiUrl}/api/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include',
      });
      console.log(apiUrl);
      if (!res.ok) {
        throw new Error('Login failed');
      }
      if (res.ok) {
        router.push('/dashboard');
      }
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={classes.wrapper}>
      <Paper className={classes.form} radius="md" withBorder>
        <Title order={2} className={classes.title}>
          Welcome back to Easeport!
        </Title>

        <form onSubmit={handleLogin}>
          <div style={{ display: 'grid', gap: 12 }}>
            <TextInput
              label="Username"
              placeholder="Your username"
              size="md"
              radius="md"
              value={username}
              onChange={(e) => setUsername(e.currentTarget.value)}
              required
            />

            <PasswordInput
              label="Password"
              placeholder="Your password"
              size="md"
              radius="md"
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              required
            />

            <Checkbox label="Keep me logged in" size="md" />

            <Button
              type="submit"
              fullWidth
              mt="md"
              size="md"
              radius="md"
              loading={IsLoading}
              disabled={IsLoading || !username.trim() || !password.trim()}
            >
              {IsLoading ? 'Logging in...' : 'Login'}
            </Button>
          </div>
        </form>
      </Paper>
    </div>
  );
}
