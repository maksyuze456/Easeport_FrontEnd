'use client';
import { useState } from 'react';
import {
  Button,
  Checkbox,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import classes from './AuthenticationImage.module.css';

type AuthenticationProps = {
  handleLogin: (username: string, password: string) => Promise<void>
  isLoading: boolean

}

export function AuthenticationImage({ handleLogin, isLoading }: AuthenticationProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await handleLogin(username, password);
  };

  return (
    <div className={classes.wrapper}>
      <Paper className={classes.form}>
        <Title order={2} className={classes.title}>
          Welcome back to Easeport!
        </Title>
        <form onSubmit={onSubmit}>
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
            loading={isLoading}
            disabled={isLoading || !username.trim() || !password.trim()}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
      </Paper>
    </div>
  );
}