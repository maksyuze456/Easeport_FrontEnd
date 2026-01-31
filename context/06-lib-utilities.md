# Library Utilities (lib/)

## Overview

The `lib/` directory contains shared utilities, clients, and hooks used across the application.

```
lib/
├── api/
│   └── axiosClient.ts       # HTTP client configuration
└── ws/
    ├── wsClient.ts          # WebSocket singleton
    ├── StompTransport.ts    # STOMP protocol handler
    └── useDashboardSubscriptions.ts  # Dashboard WS hook
```

---

## API Client

### `lib/api/axiosClient.ts`

**Purpose:** Centralized Axios instance for all HTTP requests

#### Configuration

```typescript
import axios from 'axios';

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const client = axios.create({
  baseURL: `${NEXT_PUBLIC_API_URL}/api`,
  withCredentials: true,  // Include cookies in requests
  timeout: 8000,          // 8 second timeout
});
```

#### Features
- **Base URL:** All endpoints prefixed with `/api`
- **Credentials:** Automatically sends JWT cookies
- **Timeout:** Requests fail after 8 seconds
- **Singleton:** Single instance shared across app

#### Usage in Features

```typescript
import { client } from '@/lib/api/axiosClient';

// GET request
const response = await client.get<Ticket[]>('/tickets/getAllByStatus/Open');
const tickets = response.data;

// POST request
const response = await client.post<User>('/auth/signin', {
  username: 'user',
  password: 'pass'
});
const user = response.data;

// PUT request
const response = await client.put<Ticket>(`/tickets/close/${ticketId}`);

// DELETE request
await client.delete(`/admin/users/${employeeId}`);
```

#### Error Handling

```typescript
import axios from 'axios';

try {
  const response = await client.get('/tickets/123');
} catch (error) {
  if (axios.isAxiosError(error)) {
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data);
  }
}
```

#### Future Enhancements

**Request Interceptor:**
```typescript
client.interceptors.request.use(
  (config) => {
    // Add custom headers
    config.headers['X-Custom-Header'] = 'value';
    return config;
  },
  (error) => Promise.reject(error)
);
```

**Response Interceptor:**
```typescript
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## WebSocket Utilities

### `lib/ws/wsClient.ts`

**Purpose:** Singleton WebSocket client for real-time communication

#### Class Structure

```typescript
class WsClient {
  private stompClient: StompTransport | null = null;
  private isConnectedFlag: boolean = false;

  connect(): void
  disconnect(): void
  subscribe(topic: string, callback: (message: any) => void): void
  isConnected(): boolean
}

export const wsClient = new WsClient();
```

#### Methods

**`connect(): void`**
- Initializes STOMP connection
- Creates StompTransport instance
- Sets up connection callback
- Updates `isConnectedFlag`

```typescript
wsClient.connect();
```

**`disconnect(): void`**
- Closes WebSocket connection
- Clears subscriptions
- Resets `isConnectedFlag`

```typescript
wsClient.disconnect();
```

**`subscribe(topic: string, callback: (message: any) => void): void`**
- Subscribes to STOMP topic
- Calls callback on message received
- Handles automatic resubscription on reconnect

```typescript
wsClient.subscribe('/topic/new-ticket', (message) => {
  console.log('New ticket:', message);
});
```

**`isConnected(): boolean`**
- Returns connection status

```typescript
if (wsClient.isConnected()) {
  wsClient.subscribe('/topic/assign', callback);
}
```

#### Usage Pattern

```typescript
// On login
useEffect(() => {
  if (user) {
    wsClient.connect();
  }
}, [user]);

// Subscribe to topics
useEffect(() => {
  if (!wsClient.isConnected()) return;

  wsClient.subscribe('/topic/new-ticket', handleNewTicket);
  wsClient.subscribe('/user/queue/notifications', handleNotification);

  return () => {
    // Cleanup handled automatically
  };
}, []);

// On logout
const handleLogout = () => {
  wsClient.disconnect();
};
```

---

### `lib/ws/StompTransport.ts`

**Purpose:** STOMP protocol implementation over SockJS

#### Class Structure

```typescript
import { Client, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class StompTransport {
  private client: Client;
  private subscriptions: Map<string, StompSubscription>;

  constructor()
  connect(): Promise<void>
  subscribe(topic: string, callback: (message: any) => void): void
  disconnect(): void
  isConnected(): boolean
}
```

#### Configuration

```typescript
constructor() {
  const NEXT_PUBLIC_WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8080';

  this.client = new Client({
    brokerURL: `${NEXT_PUBLIC_WS_URL}/ws`,
    webSocketFactory: () => new SockJS(`${NEXT_PUBLIC_WS_URL}/ws`),
    heartbeatIncoming: 10000,  // 10 seconds
    heartbeatOutgoing: 10000,  // 10 seconds
    reconnectDelay: 5000,      // 5 seconds
    debug: (str) => console.log(str),
  });

  this.subscriptions = new Map();
}
```

#### Features

**SockJS Fallback:**
- Uses WebSocket when available
- Falls back to HTTP polling for older browsers
- Transparent to application code

**Heartbeat Monitoring:**
- Client sends heartbeat every 10s
- Expects server heartbeat every 10s
- Detects connection loss quickly

**Auto-Reconnection:**
- Reconnects after 5s delay
- Resubscribes to all topics automatically
- Handles server restarts gracefully

**Subscription Management:**
- Tracks all subscriptions in Map
- Prevents duplicate subscriptions
- Cleans up on disconnect

#### Methods

**`connect(): Promise<void>`**
- Activates STOMP client
- Returns promise that resolves on connection

```typescript
await stompTransport.connect();
```

**`subscribe(topic: string, callback: (message: any) => void): void`**
- Subscribes to STOMP topic
- Stores subscription in Map
- Parses JSON message body

```typescript
stompTransport.subscribe('/topic/new-ticket', (data) => {
  console.log('Received:', data);
});
```

**`disconnect(): void`**
- Unsubscribes from all topics
- Deactivates STOMP client
- Clears subscription Map

```typescript
stompTransport.disconnect();
```

**`isConnected(): boolean`**
- Checks if client is connected

```typescript
if (stompTransport.isConnected()) {
  // Subscribe to topics
}
```

#### Message Format

**Incoming Message:**
```typescript
{
  body: string,  // JSON string
  headers: {},
  command: 'MESSAGE',
  // ...
}
```

**Parsed Body:**
```typescript
const data = JSON.parse(message.body);
// data is now typed object
```

---

### `lib/ws/useDashboardSubscriptions.ts`

**Purpose:** React hook for dashboard WebSocket subscriptions

#### Hook Signature

```typescript
export function useDashboardWsSubscriptions(userId?: number): void
```

#### Implementation

```typescript
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { wsClient } from './wsClient';

export function useDashboardWsSubscriptions(userId?: number): void {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId || !wsClient.isConnected()) return;

    // Public topics
    wsClient.subscribe('/topic/new-ticket', (message) => {
      queryClient.invalidateQueries({ queryKey: ["tickets", "Open"] });
    });

    wsClient.subscribe('/topic/assign', (message) => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      queryClient.invalidateQueries({ queryKey: ["myTickets"] });
    });

    // User-specific topics
    wsClient.subscribe('/user/queue/assign', (message) => {
      queryClient.invalidateQueries({ queryKey: ["myTickets", "Reviewing"] });
    });

    wsClient.subscribe('/user/queue/notifications', (message) => {
      queryClient.invalidateQueries({ queryKey: ["notifications", userId] });
    });

    wsClient.subscribe('/user/queue/ticket-messages', (message) => {
      const { ticketId } = message;
      queryClient.invalidateQueries({ queryKey: ["conversation", ticketId] });
      queryClient.invalidateQueries({ queryKey: ["ticket", ticketId] });
    });

    // Cleanup handled by wsClient
  }, [userId, queryClient]);
}
```

#### Subscribed Topics

| Topic | Type | Trigger | Action |
|-------|------|---------|--------|
| `/topic/new-ticket` | Broadcast | New ticket created | Invalidate open tickets |
| `/topic/assign` | Broadcast | Ticket assigned | Invalidate all ticket lists |
| `/user/queue/assign` | User-specific | Ticket assigned to user | Invalidate my tickets |
| `/user/queue/notifications` | User-specific | User notification | Invalidate notifications |
| `/user/queue/ticket-messages` | User-specific | New message | Invalidate conversation |

#### Usage in Dashboard

```typescript
// app/dashboard/layout.tsx
import { useDashboardWsSubscriptions } from '@/lib/ws/useDashboardSubscriptions';
import { useAuthContext } from '@/app/_context/AuthProvider';

export default function DashboardLayout({ children }) {
  const { data: user } = useAuthContext();

  // Subscribe to all dashboard topics
  useDashboardWsSubscriptions(user?.id);

  return (
    <AppShell>
      {/* Dashboard content */}
    </AppShell>
  );
}
```

#### Benefits

- **Centralized:** All subscriptions in one place
- **Automatic:** No manual subscription management
- **Real-time:** UI updates immediately on events
- **Efficient:** Only subscribes once per dashboard session

---

## Common Utilities (Future)

### Suggested Additional Utilities

**`lib/utils/formatters.ts`**
```typescript
export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString();
}

export function formatPriority(priority: string): string {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}
```

**`lib/utils/validators.ts`**
```typescript
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
```

**`lib/hooks/useDebounce.ts`**
```typescript
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
```

---

## Testing Utilities

### Mocking Axios Client

```typescript
import { client } from '@/lib/api/axiosClient';
import MockAdapter from 'axios-mock-adapter';

const mock = new MockAdapter(client);

// Mock GET request
mock.onGet('/tickets/123').reply(200, { id: 123, subject: 'Test' });

// Mock POST request
mock.onPost('/auth/signin').reply(200, { id: 1, username: 'user' });
```

### Mocking WebSocket Client

```typescript
jest.mock('@/lib/ws/wsClient', () => ({
  wsClient: {
    connect: jest.fn(),
    disconnect: jest.fn(),
    subscribe: jest.fn(),
    isConnected: jest.fn(() => true),
  },
}));
```

---

## Best Practices

### 1. Use Singleton Instances
```typescript
// Good: Single instance
export const wsClient = new WsClient();

// Bad: Create new instance
const ws = new WsClient(); // Don't do this
```

### 2. Handle Connection State
```typescript
// Good: Check before subscribing
if (wsClient.isConnected()) {
  wsClient.subscribe(topic, callback);
}

// Bad: Assume connected
wsClient.subscribe(topic, callback); // May fail
```

### 3. Clean Up Subscriptions
```typescript
// Good: Handled automatically by wsClient
useEffect(() => {
  wsClient.subscribe(topic, callback);
  // No manual cleanup needed
}, []);

// Alternative: Manual cleanup
useEffect(() => {
  const unsubscribe = customSubscribe(topic, callback);
  return () => unsubscribe();
}, []);
```

### 4. Type API Responses
```typescript
// Good: Typed response
const response = await client.get<Ticket[]>('/tickets');
const tickets: Ticket[] = response.data;

// Bad: Untyped
const response = await client.get('/tickets');
const tickets = response.data; // any type
```

---

## Environment Requirements

### Required Variables
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_WS_URL=http://localhost:8080
```

### Production Configuration
```env
NEXT_PUBLIC_API_URL=https://api.easeport.com
NEXT_PUBLIC_WS_URL=wss://api.easeport.com
```

Note: WebSocket URL should use `wss://` for HTTPS deployments.
