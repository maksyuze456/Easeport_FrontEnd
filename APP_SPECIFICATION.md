# Easeport Frontend - Application Specification

## Document Version
- **Version**: 1.0.0
- **Last Updated**: 2026-01-28
- **Application Version**: v0.1.0
- **Current Branch**: `fix/modularStructure`

---

## 1. Executive Summary

**Easeport** is an AI-powered email-to-ticket management system designed to streamline customer support workflows. This document covers the frontend application built with Next.js that interfaces with a Spring Boot Java backend.

### Core Purpose
Transform incoming emails into actionable support tickets, enabling employees to manage, respond to, and resolve customer inquiries efficiently through a modern web interface.

### Key Capabilities
- Real-time ticket management and assignment
- Email conversation threading and response
- Role-based access control (Admin/Employee)
- Live notifications via WebSocket
- Employee management (Admin)

---

## 2. System Architecture

### 2.1 Technology Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Next.js (App Router) | 15.5.9 |
| UI Library | React | 19.1.1 |
| Language | TypeScript | 5.9.2 |
| Component Library | Mantine UI | 8.3.1 |
| State Management | React Query (TanStack) | 5.90.10 |
| HTTP Client | Axios | 1.13.2 |
| Real-time | STOMP over SockJS | 7.2.1 / 1.6.1 |
| Styling | Mantine CSS-in-JS + Tailwind CSS | - |
| Testing | Jest + Playwright | 30.2.0 / 1.57.0 |
| Package Manager | Yarn | 4.10.2 |

### 2.2 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js)                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │   Pages/     │  │  Components  │  │   Context Providers  │   │
│  │   Routes     │  │  (Mantine)   │  │   (Auth, Query, WS)  │   │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘   │
│         │                 │                      │               │
│  ┌──────┴─────────────────┴──────────────────────┴───────────┐  │
│  │                    React Query Hooks                       │  │
│  │         (useTicketQueries, useAuth, useNotifications)      │  │
│  └──────────────────────────┬────────────────────────────────┘  │
│                             │                                    │
│  ┌──────────────────────────┴────────────────────────────────┐  │
│  │                     API Layer (Axios)                      │  │
│  └──────────────────────────┬────────────────────────────────┘  │
│                             │                                    │
└─────────────────────────────┼────────────────────────────────────┘
                              │
            ┌─────────────────┴─────────────────┐
            │         HTTP / WebSocket          │
            └─────────────────┬─────────────────┘
                              │
┌─────────────────────────────┼────────────────────────────────────┐
│                    BACKEND (Spring Boot)                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │  REST API    │  │  WebSocket   │  │   Email Processing   │   │
│  │  Endpoints   │  │  (STOMP)     │  │   (AI-Powered)       │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Database (PostgreSQL?)                  │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.3 Directory Structure

```
easeportFrontend/
├── app/                          # Next.js App Router
│   ├── _components/              # Shared UI components
│   │   ├── AddForm/              # Employee creation form
│   │   ├── BadgeCard/            # Feature badge display
│   │   ├── HeaderSimple/         # App header with notifications
│   │   ├── NavBarSegmented/      # Admin navigation
│   │   ├── NavbarSimple/         # Employee navigation
│   │   ├── NotificationBell/     # Notification dropdown
│   │   └── ui/                   # Basic UI elements
│   ├── _context/                 # React Context providers
│   │   ├── AuthProvider.tsx      # Authentication state
│   │   ├── ReactQueryProvider.tsx
│   │   ├── TicketProvider.tsx    # Legacy ticket state
│   │   └── EmployeeProvider.tsx  # Employee list management
│   ├── _types/                   # TypeScript type definitions
│   │   ├── tickets.ts
│   │   ├── users.ts
│   │   ├── message.ts
│   │   └── notifications.ts
│   ├── api/                      # API integration
│   │   ├── routes/               # Endpoint definitions
│   │   │   ├── auth.ts
│   │   │   ├── tickets/
│   │   │   └── notifications/
│   │   ├── utils/                # API utilities
│   │   └── client.ts             # Axios instance
│   ├── dashboard/                # Protected dashboard
│   │   ├── layout.tsx            # Dashboard shell
│   │   ├── page.tsx              # Dashboard home
│   │   ├── employee/             # Employee role pages
│   │   │   ├── tickets/          # Ticket management
│   │   │   └── my_tickets/       # Personal tickets
│   │   └── admin/                # Admin role pages
│   │       └── employees/        # Employee CRUD
│   ├── login/                    # Authentication
│   ├── welcome/                  # Landing page
│   ├── layout.tsx                # Root layout
│   ├── providers.tsx             # Provider wrapper
│   └── globals.css               # Global styles
├── lib/                          # Shared utilities
│   ├── api/                      # API client
│   ├── ws/                       # WebSocket client
│   └── hooks/                    # Custom hooks
├── features/                     # Feature modules (new structure)
│   └── auth/                     # Authentication feature
├── context/                      # Additional contexts
│   └── WebSocketContext.tsx
├── tests/                        # E2E tests (Playwright)
└── Configuration files
```

---

## 3. Feature Specifications

### 3.1 Authentication & Authorization

#### 3.1.1 Authentication Flow

```
┌─────────┐      ┌─────────┐      ┌─────────┐      ┌─────────┐
│  User   │      │ Frontend│      │ Backend │      │  Cookie │
└────┬────┘      └────┬────┘      └────┬────┘      └────┬────┘
     │                │                │                │
     │  Enter creds   │                │                │
     │───────────────>│                │                │
     │                │  POST /signin  │                │
     │                │───────────────>│                │
     │                │                │  Validate      │
     │                │                │───────────────>│
     │                │  JWT Cookie    │                │
     │                │<───────────────│                │
     │                │                │                │
     │                │  Connect WS    │                │
     │                │───────────────>│                │
     │                │                │                │
     │  Redirect to   │                │                │
     │  Dashboard     │                │                │
     │<───────────────│                │                │
```

#### 3.1.2 User Roles

| Role | Identifier | Capabilities |
|------|------------|--------------|
| Admin | `ROLE_ADMIN` | Employee management, all ticket operations |
| Employee | `ROLE_USER` | View/assign tickets, respond, close tickets |

#### 3.1.3 Protected Routes

- `/dashboard/*` - Requires authentication
- `/dashboard/admin/*` - Requires `ROLE_ADMIN`
- `/dashboard/employee/*` - Requires `ROLE_USER`

### 3.2 Ticket Management

#### 3.2.1 Ticket Data Model

```typescript
type Ticket = {
    id: number;
    subject: string;          // Email subject line
    name: string;             // Sender name
    from: string;             // Sender email
    body: string;             // Initial message content
    type: string;             // Category (IT Support, General Inquiry, etc.)
    queueType: string;        // Source (email, contact form)
    language: string;         // Detected language (en, de, etc.)
    priority: string;         // high | medium | low
    status: TicketStatus;     // Open | Reviewing | Closed
    answer: string;           // Current draft answer
    employeeId: string;       // Assigned employee ID
};

type TicketStatus = "Open" | "Reviewing" | "Closed";
```

#### 3.2.2 Ticket Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   ┌────────┐       ┌───────────┐       ┌────────┐          │
│   │  Open  │──────>│ Reviewing │──────>│ Closed │          │
│   └────────┘       └───────────┘       └────────┘          │
│       │                  │                  │               │
│       │                  │                  │               │
│    New ticket       Employee           Ticket              │
│    created          assigns to         resolved            │
│    from email       themselves         & closed            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 3.2.3 Ticket Operations

| Operation | Endpoint | Description |
|-----------|----------|-------------|
| List by Status | `GET /tickets/getAllByStatus/{status}` | Get all tickets with status |
| Get Single | `GET /tickets/{id}` | Get ticket details |
| My Tickets | `GET /tickets/employeeTickets?status={status}` | Get assigned tickets |
| Assign | `POST /tickets/assign/{id}` | Self-assign ticket |
| Set Answer | `POST /tickets/setAnswer/{id}` | Draft response |
| Send Answer | `POST /tickets/sendAnswer/{id}` | Send email response |
| Reply | `POST /tickets/sendAnswer/{id}/reply/{messageId}` | Reply to specific message |
| Close | `PUT /tickets/close/{id}` | Close ticket |

### 3.3 Conversation Management

#### 3.3.1 Message Data Model

```typescript
type TicketMessage = {
    ticketMessageId: number;
    ticketId: number;
    sender: string;           // Email address of sender
    body: string;             // Message content
    localDateTime: string;    // ISO timestamp
    emailMessageId: string;   // Email Message-ID header
    inReplyTo: string | null; // Parent message ID for threading
};
```

#### 3.3.2 Conversation Features

- **Thread Display**: Messages shown in chronological order
- **Quote/Reply**: Reply to specific messages with context
- **Real-time Updates**: WebSocket pushes new messages instantly
- **Auto-scroll**: Conversation scrolls to latest message

### 3.4 Real-time Notifications

#### 3.4.1 WebSocket Architecture

```
Frontend                              Backend
   │                                     │
   │  SockJS Connect                     │
   │────────────────────────────────────>│
   │                                     │
   │  STOMP CONNECT                      │
   │────────────────────────────────────>│
   │                                     │
   │  SUBSCRIBE /topic/new-ticket        │
   │────────────────────────────────────>│
   │                                     │
   │  SUBSCRIBE /topic/assign            │
   │────────────────────────────────────>│
   │                                     │
   │  SUBSCRIBE /user/queue/notifications│
   │────────────────────────────────────>│
   │                                     │
   │  MESSAGE (new ticket available)     │
   │<────────────────────────────────────│
   │                                     │
```

#### 3.4.2 Subscribed Topics

| Topic | Trigger | Frontend Action |
|-------|---------|-----------------|
| `/topic/new-ticket` | New ticket created | Refresh open tickets list |
| `/topic/assign` | Any ticket assigned | Refresh ticket lists |
| `/user/queue/assign` | Ticket assigned to user | Refresh my tickets |
| `/user/queue/notifications` | Personal notification | Update notification bell |
| `/user/queue/ticket-messages` | New message on ticket | Refresh conversation |

### 3.5 Admin Features

#### 3.5.1 Employee Management

| Operation | Status | Description |
|-----------|--------|-------------|
| List Employees | Implemented | View all system users |
| Create Employee | Implemented | Add new user with role |
| Update Employee | Implemented | Modify user details |
| Delete Employee | Placeholder | UI exists, not functional |

---

## 4. UI/UX Specifications

### 4.1 Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│  Header (HeaderSimple)                     [Notifications]  │
├──────────────┬──────────────────────────────────────────────┤
│              │                                              │
│   Navbar     │                                              │
│              │              Main Content                    │
│  - Tickets   │                                              │
│  - My        │              (Page Component)                │
│    Tickets   │                                              │
│              │                                              │
│  [Logout]    │                                              │
│              │                                              │
├──────────────┴──────────────────────────────────────────────┤
│  (Footer - if applicable)                                   │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Color System

#### Status Colors
| Status | Color |
|--------|-------|
| Open | Green |
| Reviewing | Yellow |
| Closed | Grey |

#### Priority Colors
| Priority | Color |
|----------|-------|
| High | Red |
| Medium | Orange |
| Low | Yellow |

### 4.3 Component Library

Primary UI components from **Mantine UI**:
- `AppShell` - Main layout container
- `NavLink` - Navigation items
- `Table` - Data tables
- `Button` - Actions
- `TextInput` / `Textarea` - Form inputs
- `Modal` - Dialogs
- `Badge` - Status indicators
- `Notification` - Toast messages
- `ScrollArea` - Scrollable containers

---

## 5. API Integration

### 5.1 API Client Configuration

```typescript
// app/api/client.ts
const client = axios.create({
    baseURL: `${NEXT_PUBLIC_API_URL}/api`,
    withCredentials: true,    // Include JWT cookie
    timeout: 8000             // 8 second timeout
});
```

### 5.2 API Response Pattern

```typescript
type ApiResult<T> =
    | { ok: true; data: T }
    | { ok: false; error: string };
```

### 5.3 Backend API Endpoints

#### Authentication
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| POST | `/auth/signin` | `{ username, password }` | User + Set-Cookie |
| GET | `/auth/me` | - | User |
| POST | `/auth/logout` | - | Success |

#### Tickets
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/tickets/getAllByStatus/{status}` | - | `Ticket[]` |
| GET | `/tickets/{id}` | - | `Ticket` |
| GET | `/tickets/employeeTickets` | `?status=` | `Ticket[]` |
| POST | `/tickets/assign/{id}` | - | `Ticket` |
| POST | `/tickets/setAnswer/{id}` | `{ message }` | `Ticket` |
| POST | `/tickets/sendAnswer/{id}` | - | `Ticket` |
| POST | `/tickets/sendAnswer/{id}/reply/{msgId}` | - | `Ticket` |
| PUT | `/tickets/close/{id}` | - | `Ticket` |

#### Messages
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/ticketMessages/getConversation/{ticketId}` | - | `TicketMessage[]` |

#### Notifications
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/users/{userId}/notifications` | - | `Notification[]` |

#### Admin
| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | `/admin/users` | - | `User[]` |

---

## 6. State Management

### 6.1 React Query Keys

```typescript
// Ticket Queries
["tickets", status]              // Tickets by status
["myTickets", status]            // User's tickets by status
["ticket", ticketId]             // Single ticket
["conversation", ticketId]       // Ticket messages

// User Queries
["user"]                         // Current user
["notifications", userId]        // User notifications
["employees"]                    // All employees (admin)
```

### 6.2 Cache Invalidation Strategy

| Mutation | Invalidates |
|----------|-------------|
| Assign Ticket | `["tickets", "Open"]`, `["myTickets", "Reviewing"]` |
| Send Answer | `["conversation", ticketId]` |
| Close Ticket | `["myTickets"]`, `["tickets"]` |

---

## 7. Environment Configuration

### 7.1 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:8080` |
| `NEXT_PUBLIC_WS_URL` | WebSocket server URL | `http://localhost:8080` |
| `NEXT_PUBLIC_SHOW_RQ_DEVTOOLS` | Show React Query DevTools | `true` |
| `E2E_USERNAME` | E2E test username | `testuser` |
| `E2E_PASSWORD` | E2E test password | `testpass` |

### 7.2 Build Configuration

```javascript
// next.config.mjs
{
    output: 'standalone',        // Docker-optimized build
    reactStrictMode: true,       // React strict mode enabled
    optimizePackageImports: ['@mantine/core', '@mantine/hooks']
}
```

---

## 8. Testing Strategy

### 8.1 Test Types

| Type | Framework | Location | Command |
|------|-----------|----------|---------|
| Unit | Jest | `app/__tests__/` | `npm run test` |
| E2E | Playwright | `tests/e2e/` | `npm run e2e` |

### 8.2 Current Test Coverage

- **Unit Tests**: Login form validation
- **E2E Tests**: Login flow, logout flow

### 8.3 CI/CD Integration

- **CI Pipeline**: Runs Jest tests on PRs to `develop`
- **CD Pipeline**: Builds Docker image, deploys to Hetzner VM

---

## 9. Deployment

### 9.1 Docker Deployment

```yaml
# Build and push
docker build -t easeport-frontend .
docker push registry/easeport-frontend

# Deploy
docker-compose up -d
```

### 9.2 Environments

| Environment | Branch | URL |
|-------------|--------|-----|
| Development | `develop` | `localhost:3000` |
| Staging | `staging` | TBD |
| Production | `master` | TBD |

---

## 10. Known Limitations & Technical Debt

### 10.1 Current Limitations

1. **Delete Employee**: UI button exists but functionality not implemented
2. **Change Account**: Feature not implemented
3. **Test Coverage**: Minimal (only login tests)
4. **Error Handling**: Basic error handling, could be improved
5. **Offline Support**: No offline/PWA capabilities

### 10.2 Technical Debt

1. **Mixed State Management**: Transitioning from Context to React Query
2. **Legacy TicketProvider**: Should be fully migrated to React Query hooks
3. **Feature Module Structure**: Only `auth` moved to features folder
4. **Type Safety**: Some `any` types need proper definitions
5. **Coverage Thresholds**: Disabled, should be enforced

---

## 11. Future Roadmap Considerations

### Potential Enhancements
- [ ] Dashboard analytics and metrics
- [ ] Ticket search and filtering
- [ ] Bulk ticket operations
- [ ] Email template management
- [ ] Ticket assignment rules/automation
- [ ] Performance monitoring
- [ ] Internationalization (i18n)
- [ ] Dark mode support
- [ ] Mobile responsive improvements

---

## 12. Integration with Spring Boot Backend

### 12.1 Expected Backend Capabilities

The frontend expects the Spring Boot backend to provide:

1. **REST API** for CRUD operations
2. **JWT Authentication** via cookies
3. **STOMP WebSocket** endpoint at `/ws`
4. **Email Processing** - Convert emails to tickets
5. **AI Integration** - For ticket categorization/suggestions

### 12.2 Communication Protocols

- **HTTP/HTTPS**: REST API calls via Axios
- **WebSocket**: STOMP over SockJS for real-time updates
- **Cookies**: JWT token for session management

### 12.3 Data Flow

```
Email Inbox
    │
    ▼
Spring Boot Backend
    │
    ├── Parse Email
    ├── AI Categorization
    ├── Create Ticket
    └── WebSocket Broadcast ──────> Frontend Updates
                                        │
                                        ▼
                                   User Dashboard
```

---

## Appendix A: Quick Reference

### NPM Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run Jest tests (watch mode)
npm run test:ci      # Run Jest tests (CI mode)
npm run e2e          # Run Playwright E2E tests
```

### Key Files

| File | Purpose |
|------|---------|
| `app/layout.tsx` | Root layout with providers |
| `app/providers.tsx` | Client-side provider setup |
| `app/api/client.ts` | Axios API client |
| `lib/ws/wsClient.ts` | WebSocket singleton |
| `app/_context/AuthProvider.tsx` | Auth state management |
| `theme.ts` | Mantine theme config |

---

*Document generated for Easeport Frontend v0.1.0*
