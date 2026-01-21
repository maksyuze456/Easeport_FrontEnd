import { useQuery } from "@tanstack/react-query";

import { getNotifications } from "../notifications";

export function useNotifications(userId?: number) {
    return useQuery({
        queryKey: ["notifications", userId],
        queryFn: () => getNotifications(userId!),
        enabled: typeof userId === "number",
    });
}
