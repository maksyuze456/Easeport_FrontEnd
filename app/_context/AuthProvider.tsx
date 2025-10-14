'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { User } from './EmployeeProvider';
import { NextResponse } from 'next/server';

export type LoggedInUser = {
    id: number
    username: string
    role: string;
}

const AuthContext = createContext<{
    loggedInUser: LoggedInUser | null;
    refetch: () => Promise<void>;
    loading: boolean;
}>({
    loggedInUser: null,
    refetch: async () => {},
    loading: true
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
    const [loadingAuth, setLoadingAuth] = useState(true);

    const fetchUser = async () => {
        try {
            const response = await fetch("http://localhost:8080/api/auth/me", {
                method: 'GET',
                credentials: 'include'
            });
            if(!response.ok){
                setLoggedInUser(null);
                setLoadingAuth(false);
                throw new Error("Error while fetching logged in user: " + response.status);
            } 
                

            const data = await response.json();
            setLoggedInUser(data);
            if(data?.role) {
                document.cookie = `role=${data.role}; path=/; samesite=lax`;
                console.log(document.cookie);
            };
            setLoadingAuth(false);

        } catch(err) {
            console.log(err);
        }
    }

    useEffect(() => {
        if(!loggedInUser) fetchUser();
    }, []);

    return (
        <AuthContext.Provider value={{loggedInUser, refetch: fetchUser, loading: loadingAuth}}>
            {children}
        </AuthContext.Provider>
    )

}

export function useAuthContext() {
    return useContext(AuthContext);
}