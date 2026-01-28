'use client';

import { IconPencil, IconTrash } from '@tabler/icons-react';
import { ActionIcon, Group, Table, Text, Badge } from '@mantine/core';
import { Employee } from '../../types';

type UsersTableProps = {
  employees: Employee[] | undefined;
  isLoading: boolean;
  onEditUser?: (user?: Employee) => void;
  onDeleteUser?: (userId: number) => void;
};

export default function UsersTable({
  employees,
  isLoading,
  onEditUser,
  onDeleteUser,
}: UsersTableProps) {
  if (isLoading) return <div>Loading employees...</div>;
  if (!employees) return <div>No employees found</div>;

  const rows = employees.map((employee) => (
    <Table.Tr key={employee.id}>
      <Table.Td>
        <Text fz="sm" fw={500}>
          {employee.username}
        </Text>
      </Table.Td>

      <Table.Td>
        <Badge color="blue" variant="light">
          {employee.role}
        </Badge>
      </Table.Td>

      <Table.Td>
        <Text fz="sm">{employee.email}</Text>
      </Table.Td>

      <Table.Td>
        <Group gap={0} justify="flex-end">
          <ActionIcon
            variant="subtle"
            color="gray"
            onClick={() => onEditUser?.(employee)}
          >
            <IconPencil size={16} stroke={1.5} />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            color="red"
            onClick={() => onDeleteUser?.(employee.id)}
          >
            <IconTrash size={16} stroke={1.5} />
          </ActionIcon>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Table.ScrollContainer minWidth={600}>
      <Table verticalSpacing="sm">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Username</Table.Th>
            <Table.Th>Role</Table.Th>
            <Table.Th>Email</Table.Th>
            <Table.Th />
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}
