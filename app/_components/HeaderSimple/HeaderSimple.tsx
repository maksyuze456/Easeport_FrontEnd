'use client';

import { useState } from 'react';
import { Burger, Container, Group, Flex } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useRouter } from 'next/navigation';
import classes from './HeaderSimple.module.css';
import NotificationBell from '../NotificationBell/NotificationBell';
import { Notification } from '../../_types/notifications';

const links = [
  { link: '/dashboard', label: 'Features' },
];

type HeaderSimpleProps = {
  notifications?: Notification[];
  notificationsLoading?: boolean;
};

export function HeaderSimple({ notifications, notificationsLoading }: HeaderSimpleProps) {
  const [opened, { toggle }] = useDisclosure(false);
  const [active, setActive] = useState(links[0].link);
  const router = useRouter();
  const items = links.map((link) => (
    <a
      key={link.label}
      href={link.link}
      className={classes.link}
      data-active={active === link.link || undefined}
      onClick={(event) => {
        event.preventDefault();
        router.push(active);
        setActive(link.link);

      }}
    >
      {link.label}
    </a>
  ));
  return (
    <header className={classes.header}>
      <Container size="md" className={classes.inner}>
        <Flex
          className={classes.logo}
        >
          <span>Ease</span>
          <span style={{
            color: '#228BE6'
          }}>Port</span>
        </Flex>
        <Group gap="md" align="center" visibleFrom="xs">
          <NotificationBell notifications={notifications} loading={notificationsLoading} />
          {items}
        </Group>

        <Burger opened={opened} onClick={toggle} hiddenFrom="xs" size="sm" />
      </Container>
    </header>
  );
}
