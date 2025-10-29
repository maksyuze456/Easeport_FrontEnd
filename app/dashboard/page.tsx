'use client';

import { Flex, Code, Text } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { BadgeCard } from '../../components/BadgeCard/BadgeCard';

export default function DashboardPage() {
  const isMobile = useMediaQuery('(max-width: 1000px)');

  return (
    <>
    <Text
    fz={'h2'}
    fw={'400'}
    >
      Features
    </Text>
    <div style={{
      marginLeft: '20px',
      marginTop: '10px'
    }}>
    <Code fw={700}>v0.1.0</Code>
    <span>:</span>
    </div>
    <Flex
      gap="xl"
      direction={isMobile ? 'column' : 'row'}
      align={isMobile ? 'center' : 'flex-start'}
      justify="center"
      wrap="wrap"
      p="md"
    >
      <BadgeCard badge='AI' description='Uses an AI model to analyze and automatically categorize emails (e.g., IT Support, General Inquiry, Technical Issue).' image='https://www.sapiosciences.com/wp-content/uploads/2023/12/How-AI-is-Transforming-Life-Sciences.jpg' title='AI-Driven Classification' />
      <BadgeCard badge='Spring' description='Retrieves and processes incoming emails via IMAP, integrates with AI for categorization, and exposes REST APIs for ticket management. Includes Spring Security with JWT-based authentication and role-based access control' image='https://mobisoftinfotech.com/resources/wp-content/uploads/2024/12/spring-boot-logo-with-microservices.png' title='Spring Boot Backend'/>
      <BadgeCard badge='Next.js' description='Next.js + React Frontend – Provides a responsive interface for viewing, updating, and closing tickets with built-in authentication and session handling' image='https://i.ytimg.com/vi/C2HU3AY7IkU/maxresdefault.jpg?sqp=-oaymwEmCIAKENAF8quKqQMa8AEB-AH-CYAC0AWKAgwIABABGGkgaShpMA8=&rs=AOn4CLD8wE30sgw7vAzF4_oS661r4VB3vg' title='Responsive Interface'/>
    </Flex>
    </>
  );
}
