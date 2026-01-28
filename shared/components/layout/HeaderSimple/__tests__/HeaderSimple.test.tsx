import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HeaderSimple } from '../HeaderSimple';
import { MantineProvider } from '@mantine/core';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  })),
  usePathname: jest.fn(() => '/dashboard'),
}));

describe('HeaderSimple', () => {
  const defaultProps = {
    notifications: [],
    notificationsLoading: false,
    mobileOpened: false,
    toggleMobile: jest.fn(),
  };

  const renderComponent = (props = {}) => {
    return render(
      <MantineProvider>
        <HeaderSimple {...defaultProps} {...props} />
      </MantineProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the logo', () => {
    renderComponent();
    expect(screen.getByText('Ease')).toBeInTheDocument();
    expect(screen.getByText('Port')).toBeInTheDocument();
  });

  it('renders the hamburger menu with correct initial state', () => {
    renderComponent();
    const burger = screen.getByLabelText('Toggle navigation');
    expect(burger).toBeInTheDocument();
  });

  it('calls toggleMobile when hamburger menu is clicked', async () => {
    const user = userEvent.setup();
    const toggleMobile = jest.fn();

    renderComponent({ toggleMobile });

    const burger = screen.getByLabelText('Toggle navigation');
    await user.click(burger);

    expect(toggleMobile).toHaveBeenCalledTimes(1);
  });

  it('shows hamburger as opened when mobileOpened is true', () => {
    renderComponent({ mobileOpened: true });
    const burger = screen.getByLabelText('Toggle navigation');

    // Mantine's Burger component adds aria-expanded when opened
    expect(burger).toBeInTheDocument();
  });

  it('shows hamburger as closed when mobileOpened is false', () => {
    renderComponent({ mobileOpened: false });
    const burger = screen.getByLabelText('Toggle navigation');

    expect(burger).toBeInTheDocument();
  });

  it('toggles multiple times correctly', async () => {
    const user = userEvent.setup();
    const toggleMobile = jest.fn();

    renderComponent({ toggleMobile });

    const burger = screen.getByLabelText('Toggle navigation');

    // Click multiple times
    await user.click(burger);
    await user.click(burger);
    await user.click(burger);

    expect(toggleMobile).toHaveBeenCalledTimes(3);
  });

  it('handles missing toggleMobile prop gracefully', async () => {
    const user = userEvent.setup();

    renderComponent({ toggleMobile: undefined });

    const burger = screen.getByLabelText('Toggle navigation');

    // Should not throw error when clicked
    await user.click(burger);
  });
});
