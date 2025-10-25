'use client';
import { createContext, useContext, useEffect, useState } from 'react';

 export type User = {
    id: number,
    username: string;
    email: string;
    role: string;
}

const EmployeeContext = createContext<{
    employees: User[] | null;
    refetch: () => Promise<void>;
}>({
    employees: null,
    refetch: async () => {}
})

export function EmployeeProvider({ children }: { children: React.ReactNode }) {

    const [employees, setEmployees] = useState<User[] | null>(null);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const fetchEmployees = async () => {
        try {
            const res = await fetch(`${apiUrl}/api/admin/users`, {
                method: 'GET',
                credentials: 'include'
            });
            if(!res.ok) throw new Error("Error while fetching employees. Status: " + res.status);

            const data = await res.json();

            setEmployees(data);


        } catch(err) {
            console.log(err);
        }
    }

    useEffect(() => {
        if (!employees) fetchEmployees();
    }, []);

    return (
        <EmployeeContext.Provider value={{ employees, refetch: fetchEmployees }}>
            {children}
        </EmployeeContext.Provider>
    );
}

export function useEmployees() {
    return useContext(EmployeeContext);
}