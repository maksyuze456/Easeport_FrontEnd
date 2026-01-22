import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthenticationImage } from '../login/_AuthenticationImage/AuthenticationImage';
import { MantineProvider } from '@mantine/core';




describe('LoginForm', () => {

    it('submits form with valid data', async () => {
        const user = userEvent.setup();
        const onSuccess = jest.fn();

        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({})
        });

        render(
            <MantineProvider>
                <AuthenticationImage onSuccess={onSuccess} />
            </MantineProvider>)

        await user.type(screen.getByLabelText(/Username/i), 'testUser');
        await user.type(screen.getByLabelText(/Password/i), 'userTest123');
        await user.click(screen.getByRole('button', { name: /Login/i }))

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    body: JSON.stringify({
                        username: 'testUser',
                        password: 'userTest123'
                    })
                })
            );
            expect(onSuccess).toHaveBeenCalled();
        })
    })
})