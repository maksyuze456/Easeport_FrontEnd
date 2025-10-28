'use client';

import { Badge, Card, CardSection, Group, Image, Text } from '@mantine/core';
import classes from './BadgeCard.module.css';

type CardProps = {
    image: string;
    title: string;
    description: string;
    badge: string;
}

export function BadgeCard({
    image,
    title,
    description,
    badge
}: CardProps) {


  return (
    <Card 
    withBorder 
    radius="md"
    p="md" 
    className={classes.card}
    maw={'350px'}

    >
      <CardSection>
        <Image src={image} alt={title} height={180} />
      </CardSection>

      <CardSection className={classes.section} mt="md">
        <Group justify="apart">
          <Text fz="lg" fw={500}>
            {title}
          </Text>
          <Badge size="sm" variant="light">
            {badge}
          </Badge>
        </Group>
        <Text fz="sm" mt="xs">
          {description}
        </Text>
      </CardSection>
    </Card>
  );
}