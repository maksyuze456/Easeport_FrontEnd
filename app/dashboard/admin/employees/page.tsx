'use client';

import { Group, Center, Button } from "@mantine/core";
import { UsersTable } from "./UsersTable";
import { IconUserPlus } from '@tabler/icons-react';
import AddForm from "../../../_components/AddForm";
import { useSearchParams, useRouter } from "next/navigation";
import { useEmployees } from '../../../_context/EmployeeProvider';

export default function EmployeesPage() {
  const searchParams = useSearchParams();
  const view = searchParams.get("view") || "list";
  const router = useRouter();
  const { refetch } = useEmployees();
  
  const handleUserAdded = async () => {
    await refetch();
    router.push("/dashboard/admin/employees?view=list");
  };

  return <div>
    <Group>
      <Button
        variant="default"
        onClick={() => router.push("/dashboard/admin/employees?view=list")}
      >Employees</Button>
      <Button 
        rightSection={<IconUserPlus size={16}/>}
        variant="default"
        onClick={() => router.push("/dashboard/admin/employees?view=add")}
        >Add</Button>
      <Button></Button>

    </Group>
    <Center>
      {view === 'list' && <UsersTable/>}
      {view === 'add' && <AddForm onUserAdded={handleUserAdded}/>}
    </Center>
  </div>
}
