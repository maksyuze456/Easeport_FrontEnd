'use client';

import { EmployeeProvider } from '../../_context/EmployeeProvider';

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <EmployeeProvider>
     {children}
    </EmployeeProvider>
  );
}