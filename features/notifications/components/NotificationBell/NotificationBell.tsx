import { ActionIcon, Indicator, Menu, Text, MenuTarget } from '@mantine/core';
import { IconBell } from '@tabler/icons-react';
import { Notification } from '../../types';

type NotificationBellProps = {
  notifications?: Notification[];
  loading?: boolean;
};

export default function NotificationBell({ notifications, loading }: NotificationBellProps) {
  const notificationCount = notifications?.length ?? 0;
  const hasNotifications = notificationCount > 0;

  return (
    <Menu shadow="md" width={260}>
      <MenuTarget>
        <Indicator
          disabled={!hasNotifications}
          label={
            <Text size="xs" fw={700} c="white">
              {notificationCount}
            </Text>
          }
          color="red"
          size={18}
          position="top-end"
          offset={4}
          withBorder
        >
          <ActionIcon
            variant="subtle"
            size="lg"
            aria-label="Open notifications"
          >
            <IconBell size={20} />
          </ActionIcon>
        </Indicator>
      </MenuTarget>

      <Menu.Dropdown>
        <Menu.Label>Notifications</Menu.Label>
        {loading && <Menu.Item disabled>Loading...</Menu.Item>}
        {!loading && !hasNotifications && (
          <Menu.Item disabled>No notifications</Menu.Item>
        )}
        {notifications?.map((notification) => (
          <Menu.Item key={notification.id}>
            <Text size="sm" fw={500}>
              {notification.type}
            </Text>
            <Text size="xs" c="dimmed">
              {notification.payload}
            </Text>
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
}
