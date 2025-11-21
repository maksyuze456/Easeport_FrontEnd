'use client';
import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { User, LoggedInUser } from '../_types/users';
import { getUser } from "../api/routes/auth";


const AuthContext = createContext<{
    loggedInUser: User | null;
    refetch: () => Promise<void>;
    loading: boolean;
}>({
    loggedInUser: null,
    refetch: async () => { },
    loading: true
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
    const [loadingAuth, setLoadingAuth] = useState(true);
    const isFetching = useRef(false);

    const url = process.env.NEXT_PUBLIC_URL;


    const fetchUser = useCallback(async () => {
        // Prevent multiple simultaneous fetches
        if (isFetching.current) {
            return;
        }

        isFetching.current = true;

        const result = await getUser();

        if (!result.ok) {
            console.log(result)
            console.error(result.error)
            setLoggedInUser(null);
            setLoadingAuth(false);
            isFetching.current = false;
            return;
        }

        setLoggedInUser(result.data);
        setLoadingAuth(false);
        isFetching.current = false;

    }, [url]);

    useEffect(() => {
        if(!loggedInUser) fetchUser();
    }, [fetchUser]);

    return (
        <AuthContext.Provider value={{ loggedInUser, refetch: fetchUser, loading: loadingAuth }}>
            {children}
        </AuthContext.Provider>
    )

}

export function useAuthContext() {
    return useContext(AuthContext);
}