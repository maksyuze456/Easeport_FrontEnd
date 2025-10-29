'use client';

import { useState } from 'react';
import {
  IconLogout,
  IconTicket,
  IconSwitchHorizontal,
  IconBriefcase2
} from '@tabler/icons-react';
import { Code, Flex, Group } from '@mantine/core';
import classes from './NavbarSimple.module.css';
import { useRouter, usePathname } from 'next/navigation';
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], display: "swap" });

const data = [
  { link: '/dashboard/employee/tickets', label: 'Tickets', icon: IconTicket },
  { link: '/dashboard/employee/my_tickets', label: 'My Tickets', icon: IconBriefcase2 },
];

export function NavbarSimple() {
  const [active, setActive] = useState('Billing');
  const router = useRouter();
  const pathname = usePathname();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
  const handleLogout = async (e: React.FormEvent) => {
    e.preventDefault();
    try{
      const res = await fetch(`${apiUrl}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      if (!res.ok) throw new Error("Error on logout");
      router.push("/");
    } catch(err) {
      console.log(err);
    }
  };
  const links = data.map((item) => {
    const isAstive = pathname === item.link;
    return(
      <a
      className={classes.link}
      data-active={isAstive || undefined}
      href={item.link}
      key={item.label}
      onClick={(event) => {
        event.preventDefault();
        if(item.link) router.push(item.link);
        setActive(item.label);
      }}
    >
      <item.icon className={classes.linkIcon} stroke={1.5} />
      <span>{item.label}</span>
    </a>
    )
  });

  return (
    <nav className={classes.navbar}>
      <div className={classes.navbarMain}>
        <div className="flex flex-1 items-center mb-6">
                      <span className={`${inter.className} text-md md:text-xl font-bold leading-none tracking-tight`}>Ease</span>
                      <span
                        className={`${inter.className} text-md md:text-xl font-bold leading-none tracking-tight`}
                        style={{
                          color: '#228be6ff',
                        }}
                      >
                        Port
                      </span>
          </div>
        {links}
      </div>

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