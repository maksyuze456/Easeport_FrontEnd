"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

export function ReactQueryProvider({ children }: { children: React.ReactNode }) {

    const [client] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 0,
                refetchOnWindowFocus: false,
                refetchOnReconnect: false,
                refetchOnMount: false,
            },
        },
    }));

    const showDevtools = process.env.NEXT_PUBLIC_SHOW_RQ_DEVTOOLS === "true";

    return (
        <QueryClientProvider client={client}>
            {children}
            {showDevtools && <ReactQueryDevtools initialIsOpen={false} />}
        </QueryClientProvider>
    );
}
