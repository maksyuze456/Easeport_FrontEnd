'use client';

import React from 'react';
import { MantineProvider } from '@mantine/core';
import { theme } from '../theme';
import { AuthProvider } from './_context/AuthProvider';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <MantineProvider theme={theme}>
        {children}
      </MantineProvider>
    </AuthProvider>
  );
}
