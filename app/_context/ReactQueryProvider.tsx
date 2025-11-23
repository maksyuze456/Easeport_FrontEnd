"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

export function ReactQueryProvider({ children }: { children: React.ReactNode }) {

    const [client] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: Infinity,
                refetchOnWindowFocus: false,
                refetchOnReconnect: false,
                refetchOnMount: false,
            },
        },
    }));

    return (
        <QueryClientProvider client={client}>
            {children}
            <ReactQueryDevtools />
        </QueryClientProvider>
    );
}
