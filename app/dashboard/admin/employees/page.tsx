'use client';

import { Group, Center, Button } from "@mantine/core";
import { IconUserPlus } from '@tabler/icons-react';
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import {
  UsersTable,
  AddEmployeeForm,
  UpdateEmployeeForm,
  Employee,
  useEmployees,
  useCreateEmployee,
  useUpdateEmployee,
} from "../../../../features/employees";

export default function EmployeesPage() {
  const searchParams = useSearchParams();
  const view = searchParams.get("view") || "list";
  const router = useRouter();
  const [selectedUser, setSelectedUser] = useState<Employee | undefined>(undefined);
  const { data: employees, isLoading, refetch } = useEmployees();
  const createEmployeeMutation = useCreateEmployee();
  const updateEmployeeMutation = useUpdateEmployee();
  
  const handleUserAdded = async () => {
    await refetch();
    router.push("/dashboard/admin/employees?view=list");
  };

  return (
  <div style={{ padding: "16px" }}>
      <Group mb="md">
        <Button
          variant="default"
          onClick={() => router.push("/dashboard/admin/employees?view=list")}
        >
          Employees
        </Button>
        <Button 
          rightSection={<IconUserPlus size={16}/>}
          variant="default"
          onClick={() => router.push("/dashboard/admin/employees?view=add")}
        >
          Add
        </Button>
      </Group>

      <Center>
        {view === 'list' && (
          <UsersTable
            employees={employees}
            isLoading={isLoading}
            onEditUser={(user) => {
              setSelectedUser(user);
              router.push("/dashboard/admin/employees?view=update");
            }}
          />
        )}
        {view === 'add' && (
          <AddEmployeeForm
            onSubmit={async (values) => {
              await createEmployeeMutation.mutateAsync(values);
              handleUserAdded();
            }}
            isLoading={createEmployeeMutation.isPending}
          />
        )}
        {view === 'update' && selectedUser && (
          <UpdateEmployeeForm
            employee={selectedUser}
            onSubmit={async (values) => {
              await updateEmployeeMutation.mutateAsync(values);
              handleUserAdded();
            }}
            isLoading={updateEmployeeMutation.isPending}
          />
        )}
      </Center>
    </div>
  )
  
}
