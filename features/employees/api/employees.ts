import { Employee } from "../types";
import { client } from "../../../lib/api/axiosClient";

export async function getEmployees(): Promise<Employee[]> {
  const { data } = await client.get("/admin/users");
  return data as Employee[];
}

export async function createEmployee(employee: {
  username: string;
  email: string;
  password: string;
  role: string;
}): Promise<Employee> {
  const { data } = await client.post("/admin/users", employee);
  return data as Employee;
}

export async function updateEmployee(employee: {
  username: string;
  email: string;
  password?: string | null;
  role: string;
}): Promise<Employee> {
  const { data } = await client.put("/admin/users/update", employee);
  return data as Employee;
}

export async function deleteEmployee(employeeId: number): Promise<void> {
  await client.delete(`/admin/users/${employeeId}`);
}
