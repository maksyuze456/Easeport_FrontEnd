'use client';

import { Group, Center, Button } from "@mantine/core";
import { UsersTable } from "./UsersTable";
import { IconUserPlus } from '@tabler/icons-react';

import { useSearchParams, useRouter } from "next/navigation";
import { useEmployees, User } from '../../../_context/EmployeeProvider';
import { useState } from "react";
import UpdateForm from "./UpdateForm";
import AddForm from "../../../_components/AddForm/AddForm";

export default function EmployeesPage() {
  const searchParams = useSearchParams();
  const view = searchParams.get("view") || "list";
  const router = useRouter();
  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);
  const { refetch } = useEmployees();
  
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
            onEditUser={(user) => {
              setSelectedUser(user);
              router.push("/dashboard/admin/employees?view=update");
            }}
          />
        )}
        {view === 'add' && <AddForm onUserAdded={handleUserAdded} />}
        {view === 'update' && <UpdateForm onUserAdded={handleUserAdded} user={selectedUser} />}
      </Center>
    </div>
  )
  
}
