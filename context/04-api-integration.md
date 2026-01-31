# API Integration & WebSocket

## HTTP Client Configuration

### Axios Client (`lib/api/axiosClient.ts`)

```typescript
import axios from 'axios';

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const client = axios.create({
  baseURL: `${NEXT_PUBLIC_API_URL}/api`,
  withCredentials: true,  // Send cookies with requests
  timeout: 8000,          // 8 second timeout
});
```

**Key Features:**
- Cookie-based authentication (JWT)
- Automatic credential inclusion
- Centralized base URL configuration
- Request/response interceptors ready for implementation

**Usage in Features:**
```typescript
import { client } from '@/lib/api/axiosClient';

const response = await client.get('/tickets/123');
const data = await client.post('/auth/signin', { username, password });
```

---

## Backend API Endpoints

Base URL: `${NEXT_PUBLIC_API_URL}/api`

### Authentication Endpoints

| Method | Endpoint | Request Body | Response | Description |
|--------|----------|--------------|----------|-------------|
| POST | `/auth/signin` | `{ username: string, password: string }` | `User` + Set-Cookie | Login |
| GET | `/auth/me` | - | `User` | Get current user |
| POST | `/auth/logout` | - | Success | Logout |

**Response Headers:**
```
Set-Cookie: JWT=<token>; HttpOnly; Secure; SameSite=Strict
Set-Cookie: role=ROLE_USER; Path=/
```

---

### Ticket Endpoints

#### List Tickets
| Method | Endpoint | Query Params | Response | Access |
|--------|----------|--------------|----------|--------|
| GET | `/tickets/getAllByStatus/{status}` | - | `Ticket[]` | Admin only |
| GET | `/tickets/employeeTickets` | `?status=Open\|Reviewing\|Closed` | `Ticket[]` | All authenticated |

#### Single Ticket
| Method | Endpoint | Response | Description |
|--------|----------|----------|-------------|
| GET | `/tickets/{ticketId}` | `Ticket` | Get ticket details |

#### Ticket Actions
| Method | Endpoint | Request Body | Response | Description |
|--------|----------|--------------|----------|-------------|
| POST | `/tickets/assign/{ticketId}` | - | `Ticket` | Assign to current user |
| POST | `/tickets/setAnswer/{ticketId}` | `{ message: string }` | `Ticket` | Draft response |
| POST | `/tickets/sendAnswer/{ticketId}` | - | `Ticket` | Send email response |
| POST | `/tickets/sendAnswer/{ticketId}/reply/{messageId}` | - | `Ticket` | Reply to specific message |
| PUT | `/tickets/close/{ticketId}` | - | `Ticket` | Close ticket |

#### Conversations
| Method | Endpoint | Response | Description |
|--------|----------|----------|-------------|
| GET | `/ticketMessages/getConversation/{ticketId}` | `TicketMessage[]` | Get message thread |

---

### Employee Management Endpoints (Admin)

| Method | Endpoint | Request Body | Response | Access |
|--------|----------|--------------|----------|--------|
| GET | `/admin/users` | - | `Employee[]` | ROLE_ADMIN |
| POST | `/admin/users` | `CreateEmployeeInput` | `Employee` | ROLE_ADMIN |
| PUT | `/admin/users/update` | `UpdateEmployeeInput` | `Employee` | ROLE_ADMIN |
| DELETE | `/admin/users/{employeeId}` | - | Success | ROLE_ADMIN |

**Request Types:**
```typescript
CreateEmployeeInput: {
  username: string;
  email: string;
  password: string;
  role: string;
}

UpdateEmployeeInput: {
  id: number;
  username: string;
  email: string;
  role: string;
}
```

---

### Notification Endpoints

| Method | Endpoint | Response | Description |
|--------|----------|----------|-------------|
| GET | `/users/{userId}/notifications` | `Notification[]` | Get user notifications |

---

## WebSocket Integration

### Architecture

```
Frontend                    Backend (Spring Boot)
   │                              │
   │  1. SockJS Connect            │
   │─────────────────────────────>│
   │                              │
   │  2. STOMP CONNECT             │
   │─────────────────────────────>│
   │                              │
   │  3. SUBSCRIBE topics          │
   │─────────────────────────────>│
   │                              │
   │  4. MESSAGE (events)          │
   │<─────────────────────────────│
   │                              │
   │  5. Invalidate queries        │
   │  6. UI updates                │
```

---

### WebSocket Client (`lib/ws/wsClient.ts`)

**Singleton Instance:**
```typescript
class WsClient {
  private stompClient: StompTransport | null;
  private isConnectedFlag: boolean;

  connect(): void
  disconnect(): void
  subscribe(topic: string, callback: (message: any) => void): void
  isConnected(): boolean
}

export const wsClient = new WsClient();
```

**Usage:**
```typescript
import { wsClient } from '@/lib/ws/wsClient';

// Connect on login
wsClient.connect();

// Subscribe to topic
wsClient.subscribe('/topic/new-ticket', (message) => {
  console.log('New ticket:', message);
});

// Disconnect on logout
wsClient.disconnect();
```

---

### STOMP Transport (`lib/ws/StompTransport.ts`)

**Implementation Details:**
```typescript
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

**Configuration:**
```typescript
new Client({
  brokerURL: `${NEXT_PUBLIC_WS_URL}/ws`,
  webSocketFactory: () => new SockJS(`${NEXT_PUBLIC_WS_URL}/ws`),
  heartbeatIncoming: 10000,
  heartbeatOutgoing: 10000,
  reconnectDelay: 5000,
  debug: (str) => console.log(str)
});
```

**Features:**
- Auto-reconnection (5s delay)
- Heartbeat monitoring (10s intervals)
- Subscription management
- SockJS fallback for older browsers

---

### Dashboard Subscriptions Hook

**File:** `lib/ws/useDashboardSubscriptions.ts`

```typescript
export function useDashboardWsSubscriptions(userId?: number): void
```

**Subscribed Topics:**

#### Public Topics (Broadcast)
| Topic | Trigger | Frontend Action |
|-------|---------|-----------------|
| `/topic/new-ticket` | New ticket created | Invalidate `["tickets", "Open"]` |
| `/topic/assign` | Any ticket assigned | Invalidate `["tickets"]`, `["myTickets"]` |

#### User-Specific Topics (Private)
| Topic | Trigger | Frontend Action |
|-------|---------|-----------------|
| `/user/queue/assign` | Ticket assigned to user | Invalidate `["myTickets", "Reviewing"]` |
| `/user/queue/notifications` | User notification sent | Invalidate `["notifications", userId]` |
| `/user/queue/ticket-messages` | New message on user's ticket | Invalidate `["conversation", ticketId]` |

**Implementation:**
```typescript
useEffect(() => {
  if (!userId || !wsClient.isConnected()) return;

  // Subscribe to topics
  wsClient.subscribe('/topic/new-ticket', (message) => {
    queryClient.invalidateQueries({ queryKey: ["tickets", "Open"] });
  });

  wsClient.subscribe('/topic/assign', (message) => {
    queryClient.invalidateQueries({ queryKey: ["tickets"] });
    queryClient.invalidateQueries({ queryKey: ["myTickets"] });
  });

  // ... more subscriptions

  return () => {
    // Cleanup handled by wsClient
  };
}, [userId, queryClient]);
```

**Usage in Dashboard:**
```typescript
// app/dashboard/layout.tsx
const { data: user } = useAuthContext();
useDashboardWsSubscriptions(user?.id);
```

---

## API Response Patterns

### Success Response
```typescript
{
  ok: true,
  data: T
}
```

### Error Response
```typescript
{
  ok: false,
  error: string
}
```

### Typed Responses
All API functions return typed data:
```typescript
async function getTicketById(id: number): Promise<Ticket> {
  const response = await client.get<Ticket>(`/tickets/${id}`);
  return response.data;
}
```

---

## Error Handling

### HTTP Errors
```typescript
try {
  const data = await getTicketById(123);
} catch (error) {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 401) {
      // Redirect to login
    }
    if (error.response?.status === 403) {
      // Show unauthorized message
    }
    if (error.response?.status === 404) {
      // Show not found
    }
  }
}
```

### React Query Error Handling
```typescript
const { data, error, isError } = useTickets();

if (isError) {
  return <ErrorMessage error={error.message} />;
}
```

---

## API Call Flow

### Standard Flow
```
User Action
  ↓
React Component
  ↓
React Query Hook
  ↓
Feature API Function
  ↓
Axios Client
  ↓
Backend API
  ↓
Response
  ↓
React Query Cache
  ↓
Component Re-render
```

### With WebSocket
```
Backend Event (e.g., new ticket)
  ↓
WebSocket Message
  ↓
useDashboardSubscriptions
  ↓
Query Invalidation
  ↓
React Query Refetch
  ↓
Component Re-render
```

---

## Request Interceptors (Future)

Can add interceptors to axios client:
```typescript
// Request interceptor
client.interceptors.request.use(
  (config) => {
    // Add custom headers
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
client.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Global error handling
    if (error.response?.status === 401) {
      // Redirect to login
    }
    return Promise.reject(error);
  }
);
```

---

## Environment Configuration

### Required Variables
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_WS_URL=http://localhost:8080
```

### Production Example
```env
NEXT_PUBLIC_API_URL=https://api.easeport.com
NEXT_PUBLIC_WS_URL=https://api.easeport.com
```

---

## CORS Configuration

Backend must allow:
```
Access-Control-Allow-Origin: <frontend-url>
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
```

---

## WebSocket Connection Lifecycle

```
Login → connect()
  ↓
Subscribe to topics
  ↓
Receive messages
  ↓
Invalidate queries
  ↓
UI updates
  ↓
Logout → disconnect()
```

**Connection Management:**
- Connected once per session
- Shared across all components
- Auto-reconnects on connection loss
- Gracefully handles server restarts

---

## Testing API Integration

### Mock Axios in Tests
```typescript
import { client } from '@/lib/api/axiosClient';
import MockAdapter from 'axios-mock-adapter';

const mock = new MockAdapter(client);

mock.onGet('/tickets/123').reply(200, {
  id: 123,
  subject: 'Test Ticket'
});
```

### Mock WebSocket in Tests
```typescript
import { wsClient } from '@/lib/ws/wsClient';

jest.mock('@/lib/ws/wsClient', () => ({
  wsClient: {
    connect: jest.fn(),
    subscribe: jest.fn(),
    disconnect: jest.fn(),
    isConnected: jest.fn(() => true)
  }
}));
```
