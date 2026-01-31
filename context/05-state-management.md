# State Management with React Query

## Overview

Easeport uses **React Query (TanStack Query)** v5.90.10 as the primary state management solution for:
- Server state caching
- Data fetching
- Mutation management
- Cache invalidation
- Real-time synchronization

**No Redux, Zustand, or global state libraries used.**

---

## React Query Configuration

### Setup (`app/_context/ReactQueryProvider.tsx`)

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,                    // Data immediately stale
      refetchOnWindowFocus: false,     // Don't refetch on focus
      refetchOnReconnect: false,       // Don't refetch on reconnect
      refetchOnMount: false,           // Don't refetch on mount
    },
  },
});

export function ReactQueryProvider({ children }: Props) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NEXT_PUBLIC_SHOW_RQ_DEVTOOLS === 'true' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
```

**Why these defaults?**
- Aggressive manual invalidation strategy
- WebSocket triggers refetches explicitly
- Avoid unnecessary background refetches
- Developer controls when data updates

---

## Query Keys Structure

### Organized by Feature

#### Auth Queries
```typescript
["user"]                     // Current authenticated user
```

#### Ticket Queries
```typescript
["tickets", status]          // All tickets by status (admin)
  // Examples:
  ["tickets", "Open"]
  ["tickets", "Reviewing"]
  ["tickets", "Closed"]

["myTickets", status]        // User's assigned tickets
  // Examples:
  ["myTickets", "Reviewing"]
  ["myTickets", "Closed"]

["ticket", ticketId]         // Single ticket detail
  // Example: ["ticket", 123]

["conversation", ticketId]   // Ticket message thread
  // Example: ["conversation", 123]
```

#### Employee Queries
```typescript
["employees"]                // All employees (admin only)
```

#### Notification Queries
```typescript
["notifications", userId]    // User's notifications
  // Example: ["notifications", 42]
```

---

## Query Patterns

### Basic Query Hook

```typescript
import { useQuery } from '@tanstack/react-query';

export function useTickets(status: TicketStatus) {
  return useQuery({
    queryKey: ["tickets", status],
    queryFn: () => getTicketsByStatus(status),
  });
}
```

**Usage:**
```typescript
const { data, isLoading, error, refetch } = useTickets("Open");
```

---

### Conditional Query

```typescript
export function useNotifications(userId?: number) {
  return useQuery({
    queryKey: ["notifications", userId],
    queryFn: () => getNotifications(userId!),
    enabled: typeof userId === "number",  // Only run if userId exists
  });
}
```

---

### Query with Custom Stale Time

```typescript
export function useAuth() {
  return useQuery({
    queryKey: ["user"],
    queryFn: getUser,
    staleTime: 60 * 1000,  // 60 seconds (auth is stable)
  });
}
```

---

## Mutation Patterns

### Basic Mutation

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useAssignTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ticketId: number) => assignTicket(ticketId),
    onSuccess: (_, ticketId) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["tickets", "Open"] });
      queryClient.invalidateQueries({ queryKey: ["myTickets", "Reviewing"] });
      queryClient.invalidateQueries({ queryKey: ["ticket", ticketId] });
    },
  });
}
```

**Usage:**
```typescript
const assignMutation = useAssignTicket();

const handleAssign = (ticketId: number) => {
  assignMutation.mutate(ticketId, {
    onSuccess: () => {
      console.log('Ticket assigned!');
    },
    onError: (error) => {
      console.error('Failed to assign:', error);
    },
  });
};
```

---

### Mutation with Optimistic Update

```typescript
export function useCloseTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ticketId: number) => closeTicket(ticketId),
    onMutate: async (ticketId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["ticket", ticketId] });

      // Snapshot current value
      const previousTicket = queryClient.getQueryData(["ticket", ticketId]);

      // Optimistically update
      queryClient.setQueryData(["ticket", ticketId], (old: Ticket) => ({
        ...old,
        status: "Closed",
      }));

      return { previousTicket };
    },
    onError: (err, ticketId, context) => {
      // Rollback on error
      queryClient.setQueryData(["ticket", ticketId], context?.previousTicket);
    },
    onSettled: (_, __, ticketId) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ["ticket", ticketId] });
    },
  });
}
```

---

## Cache Invalidation Strategy

### Single Query Invalidation
```typescript
queryClient.invalidateQueries({ queryKey: ["ticket", ticketId] });
```

### Partial Key Invalidation
```typescript
// Invalidates all ticket queries (all statuses)
queryClient.invalidateQueries({ queryKey: ["tickets"] });

// Invalidates only "Open" tickets
queryClient.invalidateQueries({ queryKey: ["tickets", "Open"] });
```

### Multiple Invalidations
```typescript
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ["tickets"] });
  queryClient.invalidateQueries({ queryKey: ["myTickets"] });
  queryClient.invalidateQueries({ queryKey: ["notifications", userId] });
}
```

---

## Invalidation Matrix

### Mutation → Invalidated Queries

| Mutation | Invalidated Queries | Reason |
|----------|---------------------|--------|
| **Assign Ticket** | `["tickets", "Open"]` | Ticket removed from open list |
| | `["myTickets", "Reviewing"]` | Ticket added to my reviewing list |
| | `["ticket", ticketId]` | Update single ticket view |
| **Send Answer** | `["conversation", ticketId]` | New message added to thread |
| | `["ticket", ticketId]` | Update ticket with sent answer |
| **Close Ticket** | `["myTickets"]` | Remove from my tickets |
| | `["tickets"]` | Update ticket lists |
| | `["ticket", ticketId]` | Update single ticket view |
| **Create Employee** | `["employees"]` | Refresh employee list |
| **Update Employee** | `["employees"]` | Refresh employee list |
| **Delete Employee** | `["employees"]` | Refresh employee list |

---

## WebSocket-Triggered Invalidation

### From `useDashboardSubscriptions`

```typescript
// New ticket created
wsClient.subscribe('/topic/new-ticket', (message) => {
  queryClient.invalidateQueries({ queryKey: ["tickets", "Open"] });
});

// Ticket assigned (any user)
wsClient.subscribe('/topic/assign', (message) => {
  queryClient.invalidateQueries({ queryKey: ["tickets"] });
  queryClient.invalidateQueries({ queryKey: ["myTickets"] });
});

// Ticket assigned to current user
wsClient.subscribe('/user/queue/assign', (message) => {
  queryClient.invalidateQueries({ queryKey: ["myTickets", "Reviewing"] });
});

// Notification received
wsClient.subscribe('/user/queue/notifications', (message) => {
  queryClient.invalidateQueries({ queryKey: ["notifications", userId] });
});

// New message on ticket
wsClient.subscribe('/user/queue/ticket-messages', (message) => {
  const { ticketId } = message;
  queryClient.invalidateQueries({ queryKey: ["conversation", ticketId] });
  queryClient.invalidateQueries({ queryKey: ["ticket", ticketId] });
});
```

**Result:** Real-time UI updates without manual refresh

---

## Manual Refetch

### Force Refetch
```typescript
const { refetch } = useTickets("Open");

// Later...
await refetch();
```

### Refetch All Queries
```typescript
queryClient.invalidateQueries();
```

### Refetch Specific Queries
```typescript
queryClient.refetchQueries({ queryKey: ["tickets"] });
```

---

## Cache Management

### Get Cached Data
```typescript
const ticket = queryClient.getQueryData<Ticket>(["ticket", 123]);
```

### Set Cached Data
```typescript
queryClient.setQueryData(["ticket", 123], updatedTicket);
```

### Remove Cached Data
```typescript
queryClient.removeQueries({ queryKey: ["ticket", 123] });
```

### Reset All Queries
```typescript
queryClient.resetQueries();
```

---

## Query Lifecycle

```
Component Mount
  ↓
useQuery called
  ↓
Check cache
  ↓
Cache hit?
├─ Yes → Return cached data → Check if stale
│                              ├─ Yes → Refetch in background
│                              └─ No → Use cache
└─ No → Fetch from API
         ↓
      Update cache
         ↓
      Return data
         ↓
    Component renders
```

---

## Mutation Lifecycle

```
User Action (e.g., assign ticket)
  ↓
useMutation.mutate(ticketId)
  ↓
onMutate (optional optimistic update)
  ↓
API call (mutationFn)
  ↓
Success?
├─ Yes → onSuccess
│        ↓
│     Invalidate queries
│        ↓
│     Automatic refetch
│        ↓
│     UI updates
│
└─ No → onError
        ↓
     Rollback optimistic update
        ↓
     Show error message
```

---

## Loading States

### Query Loading
```typescript
const { data, isLoading, isFetching, isError } = useTickets("Open");

if (isLoading) return <Loader />; // Initial load
if (isFetching) return <Spinner />; // Background refetch
if (isError) return <Error />;
```

### Mutation Loading
```typescript
const assignMutation = useAssignTicket();

<Button
  onClick={() => assignMutation.mutate(ticketId)}
  loading={assignMutation.isPending}
>
  Assign to Me
</Button>
```

---

## DevTools

### Enable DevTools
```env
NEXT_PUBLIC_SHOW_RQ_DEVTOOLS=true
```

### Features
- View all queries
- See query states (loading, success, error)
- Inspect cached data
- Manually refetch queries
- Clear cache
- View mutations

**Access:** Bottom-left corner (flower icon)

---

## Best Practices

### 1. Consistent Query Keys
```typescript
// Good: Organized by feature and parameters
["tickets", "Open"]
["ticket", ticketId]

// Bad: Inconsistent or flat
["openTickets"]
["ticketDetail123"]
```

### 2. Invalidate Related Queries
```typescript
// After assigning ticket, invalidate all related queries
onSuccess: (_, ticketId) => {
  queryClient.invalidateQueries({ queryKey: ["tickets"] });
  queryClient.invalidateQueries({ queryKey: ["myTickets"] });
  queryClient.invalidateQueries({ queryKey: ["ticket", ticketId] });
}
```

### 3. Use Optimistic Updates for Fast UI
```typescript
// For operations that rarely fail
onMutate: async (ticketId) => {
  queryClient.setQueryData(["ticket", ticketId], (old) => ({
    ...old,
    status: "Closed",
  }));
}
```

### 4. Conditional Queries
```typescript
// Only fetch if required data exists
enabled: !!ticketId
```

### 5. Separate Query Hooks
```typescript
// One hook per query type
useTickets(status)
useTicket(ticketId)
useMyTickets(status)
```

---

## Common Patterns

### Dependent Queries
```typescript
const { data: ticket } = useTicket(ticketId);
const { data: conversation } = useConversation(ticket?.id, {
  enabled: !!ticket?.id,
});
```

### Parallel Queries
```typescript
const ticketsQuery = useTickets("Open");
const myTicketsQuery = useMyTickets("Reviewing");
const notificationsQuery = useNotifications(userId);

// All fetch in parallel
```

### Sequential Mutations
```typescript
const assignMutation = useAssignTicket();
const sendMutation = useSendAnswer();

const handleAssignAndSend = async (ticketId: number) => {
  await assignMutation.mutateAsync(ticketId);
  await sendMutation.mutateAsync(ticketId);
};
```

---

## Error Handling

### Query Error
```typescript
const { error, isError } = useTickets("Open");

if (isError) {
  return <Alert color="red">{error.message}</Alert>;
}
```

### Mutation Error
```typescript
const assignMutation = useAssignTicket();

assignMutation.mutate(ticketId, {
  onError: (error) => {
    notifications.show({
      title: 'Error',
      message: error.message,
      color: 'red',
    });
  },
});
```

---

## Cache Persistence

Currently **not implemented**, but can be added:

```typescript
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

const persister = createSyncStoragePersister({
  storage: window.localStorage,
});

persistQueryClient({
  queryClient,
  persister,
});
```

This would cache queries in localStorage for offline support.

---

## Migration from Context API

### Old Pattern (Context)
```typescript
const [tickets, setTickets] = useState<Ticket[]>([]);

useEffect(() => {
  getTickets().then(setTickets);
}, []);
```

### New Pattern (React Query)
```typescript
const { data: tickets } = useTickets("Open");
// Handles loading, error, caching automatically
```

**Benefits:**
- No manual loading states
- No manual error handling
- Automatic caching
- Real-time invalidation
- DevTools for debugging
