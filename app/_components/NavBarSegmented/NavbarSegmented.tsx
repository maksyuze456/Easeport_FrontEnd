'use client';
import { useState } from 'react';
import {
  IconLogout,
  IconSettings,
  IconSwitchHorizontal,
  IconUsers,
} from '@tabler/icons-react';
import { SegmentedControl, Flex, Code } from '@mantine/core';
import classes from './NavbarSegmented.module.css';
import { useRouter, usePathname } from 'next/navigation';
const tabs = {
  account: [
    { link: '', label: 'Settings', icon: IconSettings },
  ],
  general: [
    { link: '/dashboard/admin/employees', label: 'Employees', icon: IconUsers },
  ],
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

export function NavbarSegmented() {
  const router = useRouter();
  const pathname = usePathname();
  const [section, setSection] = useState<'account' | 'general'>('account');
  const [active, setActive] = useState('Billing');
  const handleLogout = async (e: React.FormEvent) => {
    e.preventDefault();
    try{
      const res = await fetch(`${apiUrl}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      if (!res.ok) throw new Error("Error on logout");
      router.push("/login");
    } catch(err) {
      console.log(err);
    }
  };
  const links = tabs[section].map((item) => {
    const isAstive = pathname === item.link;

    return (
    <a
      className={classes.link}
      data-active={isAstive || undefined}
      href={item.link}
      key={item.label}
      onClick={(event) => {
        event.preventDefault();
        if (item.link) router.push(item.link);
        setActive(item.label);
      }}
    >
      <item.icon className={classes.linkIcon} stroke={1.5} />
      <span>{item.label}</span>
    </a>
  )});
  

  return (
    <nav className={classes.navbar}>
      <div>
          <Flex
          direction={'row'}
          justify={'space-between'}
          className={classes.logo}
          >
            <div>  
            <span>Ease</span>
            <span style={{
              color: '#228BE6'
            }}>Port</span>
            </div>            
          <Code fw={700}>v0.1.0</Code>
          </Flex>
        <SegmentedControl
          value={section}
          onChange={(value: any) => setSection(value)}
          transitionTimingFunction="ease"
          fullWidth
          data={[
            { label: 'Account', value: 'account' },
            { label: 'System', value: 'general' },
          ]}
        />
      </div>

      <div className={classes.navbarMain}>{links}</div>

      <div className={classes.footer}>
        <a href="#" className={classes.link} onClick={(event) => event.preventDefault()}>
          <IconSwitchHorizontal className={classes.linkIcon} stroke={1.5} />
          <span>Change account</span>
        </a>

        <a href="#" className={classes.link} onClick={handleLogout}>
          <IconLogout className={classes.linkIcon} stroke={1.5} />
          <span>Logout</span>
        </a>
      </div>
    </nav>
  );
}