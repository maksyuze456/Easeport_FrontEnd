import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthenticationImage } from '../../features/auth';
import { MantineProvider } from '@mantine/core';

describe('LoginForm', () => {
  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    const handleLogin = jest.fn();

    render(
      <MantineProvider>
        <AuthenticationImage handleLogin={handleLogin} isLoading={false} />
      </MantineProvider>
    );

    await user.type(screen.getByLabelText(/Username/i), 'testUser');
    await user.type(screen.getByLabelText(/Password/i), 'userTest123');
    await user.click(screen.getByRole('button', { name: /Login/i }));

    await waitFor(() => {
      expect(handleLogin).toHaveBeenCalledWith('testUser', 'userTest123');
    });
  });
});