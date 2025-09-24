'use client';
import { createContext, useContext, useEffect, useState } from 'react';

type User = {
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

    const fetchEmployees = async () => {
        try {
            const res = await fetch("http://localhost:8080/api/admin/users", {
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