# Features Directory - Complete Overview

## Feature-Based Architecture

All features follow a consistent modular structure:

```
features/{feature}/
├── api/              # API functions using axiosClient
├── components/       # React components for this feature
├── hooks/            # React Query hooks (queries & mutations)
├── types.ts          # TypeScript type definitions
└── index.ts          # Barrel exports
```

---

## 1. Auth Feature (`/features/auth`)

**Purpose:** User authentication, login, logout, session management

### Files

#### `api/auth.ts`
```typescript
export async function getUser(): Promise<User | null>
  // Fetches current user, sets role cookie

export async function signIn(username: string, password: string): Promise<User>
  // Login endpoint: POST /auth/signin

export async function logout(): Promise<void>
  // Logout endpoint: POST /auth/logout
```

#### `queries/useUser.ts`
```typescript
export function useAuth()
  // React Query hook for authentication
  // Query Key: ["user"]
  // Stale Time: 60 seconds
  // Includes refetch functions
```

#### `components/AuthenticationImage/AuthenticationImage.tsx`
- Login form UI component
- Uses Mantine form validation
- Calls signIn mutation
- Redirects to dashboard on success

#### `types.ts`
```typescript
export type User = {
  id: number;
  username: string;
  role: string; // "ROLE_ADMIN" | "ROLE_USER"
};
```

### Key Pattern
- React Query caches auth state
- Role stored in cookie for middleware access
- Auth context wraps entire app

---

## 2. Employees Feature (`/features/employees`)

**Purpose:** Employee/user management (Admin only)

### Files

#### `api/employees.ts`
```typescript
export async function getEmployees(): Promise<Employee[]>
  // GET /admin/users

export async function createEmployee(data: CreateEmployeeInput): Promise<Employee>
  // POST /admin/users

export async function updateEmployee(data: UpdateEmployeeInput): Promise<Employee>
  // PUT /admin/users/update

export async function deleteEmployee(employeeId: number): Promise<void>
  // DELETE /admin/users/{employeeId}
```

#### `hooks/useEmployees.ts`
```typescript
export function useEmployees()
  // Query: ["employees"]
  // Returns: { data, isLoading, error, refetch }

export function useCreateEmployee()
  // Mutation: Creates employee
  // OnSuccess: Invalidates ["employees"]

export function useUpdateEmployee()
  // Mutation: Updates employee
  // OnSuccess: Invalidates ["employees"]

export function useDeleteEmployee()
  // Mutation: Deletes employee
  // OnSuccess: Invalidates ["employees"]
```

#### Components

**`UsersTable/UsersTable.tsx`**
- Displays employee list in Mantine Table
- Edit/Delete action buttons
- Opens UpdateEmployeeForm modal
- Calls delete mutation

**`AddEmployeeForm/AddEmployeeForm.tsx`**
- Form: username, email, password, role
- Uses useCreateEmployee hook
- Closes modal on success

**`UpdateEmployeeForm/UpdateEmployeeForm.tsx`**
- Form: username, email, role
- Pre-fills with employee data
- Uses useUpdateEmployee hook

#### `types.ts`
```typescript
export type Employee = {
  id: number;
  username: string;
  email: string;
  role: string;
};

export type CreateEmployeeInput = {
  username: string;
  email: string;
  password: string;
  role: string;
};

export type UpdateEmployeeInput = {
  id: number;
  username: string;
  email: string;
  role: string;
};
```

### Key Pattern
- Query invalidation after mutations
- Automatic table updates without manual refresh
- Modal-based CRUD forms

---

## 3. Tickets Feature (`/features/tickets`)

**Purpose:** Core ticket management, assignment, conversations

### Files

#### `api/tickets.ts`
```typescript
export async function getTicketsByStatus(status: TicketStatus): Promise<Ticket[]>
  // GET /tickets/getAllByStatus/{status}
  // Admin: All tickets by status

export async function getMyTickets(status: TicketStatus): Promise<Ticket[]>
  // GET /tickets/employeeTickets?status={status}
  // Employee: Assigned tickets only

export async function getTicketById(ticketId: number): Promise<Ticket>
  // GET /tickets/{ticketId}

export async function getConversation(ticketId: number): Promise<TicketMessage[]>
  // GET /ticketMessages/getConversation/{ticketId}

export async function assignTicket(ticketId: number): Promise<Ticket>
  // POST /tickets/assign/{ticketId}
  // Assigns ticket to current user

export async function setAnswer(ticketId: number, message: string): Promise<Ticket>
  // POST /tickets/setAnswer/{ticketId}
  // Drafts response (doesn't send)

export async function sendAnswer(
  ticketId: number,
  replyToMessageId?: number
): Promise<Ticket>
  // POST /tickets/sendAnswer/{ticketId}
  // POST /tickets/sendAnswer/{ticketId}/reply/{messageId}
  // Sends email response

export async function closeTicket(ticketId: number): Promise<Ticket>
  // PUT /tickets/close/{ticketId}
```

#### `hooks/useTicketQueries.ts`

**Queries:**
```typescript
export function useTicketsByStatus(status: TicketStatus)
  // Query: ["tickets", status]
  // Admin view

export function useMyTickets(status: TicketStatus)
  // Query: ["myTickets", status]
  // Employee view

export function useTicketById(ticketId: number)
  // Query: ["ticket", ticketId]

export function useConversationById(ticketId: number)
  // Query: ["conversation", ticketId]
```

**Mutations:**
```typescript
export function useAssignTicket()
  // Mutation: Assign ticket
  // Invalidates: ["tickets", "Open"], ["myTickets", "Reviewing"], ["ticket", id]

export function useSetAnswer()
  // Mutation: Draft response
  // Invalidates: ["ticket", id]

export function useSendAnswer()
  // Mutation: Send response
  // Supports reply to specific message
  // Invalidates: ["conversation", id], ["ticket", id]

export function useCloseTicket()
  // Mutation: Close ticket
  // Invalidates: ["myTickets"], ["tickets"], ["ticket", id]
```

#### Components

**`TicketsTable/TicketsTable.tsx`**
- Props: tickets[], onTicketClick(id)
- Responsive: Table view (desktop) / Card view (mobile)
- Shows: subject, from, status, priority, type
- Exports: priorityColors, ticketStatusColors

**Legacy Components:**
- `ViewTicket/ViewTicket.tsx` - Full ticket detail (older)
- `ViewConversation/ViewConversation.tsx` - Conversation UI (older)

**New Modular Components:**

**`TicketDetail/`** - Decomposed ticket detail
- `TicketHeader.tsx` - Title, status, metadata header
- `TicketDescription.tsx` - Email body content
- `TicketMetadata.tsx` - From, type, priority, language info
- `TicketSidebar.tsx` - Actions (assign, close buttons)

**`ConversationPanel/`** - Message thread
- `ConversationPanel.tsx` - Main container with ScrollArea
- `MessageBubble.tsx` - Individual message display
- `ReplyForm.tsx` - Textarea + send button

**`shared/`** - Reusable ticket components
- `PriorityIcon/PriorityIcon.tsx` - Icon based on priority
- `StatusBadge/StatusBadge.tsx` - Colored badge for status

#### `types.ts`
```typescript
export type TicketStatus = "Open" | "Reviewing" | "Closed";

export type Ticket = {
  id: number;
  subject: string;
  name: string;
  from: string;
  body: string;
  type: string;
  queueType: string;
  language: string;
  priority: string;
  status: TicketStatus;
  answer: string;
  employeeId: string;
};

export type TicketMessage = {
  ticketMessageId: number;
  ticketId: number;
  sender: string;
  body: string;
  localDateTime: string;
  emailMessageId: string;
  inReplyTo: string | null;
};
```

### Key Patterns
- Extensive query invalidation for real-time sync
- Separate hooks for admin/employee views
- Modular component breakdown
- Reply threading support

---

## 4. Notifications Feature (`/features/notifications`)

**Purpose:** User notifications via WebSocket

### Files

#### `api/notifications.ts`
```typescript
export async function getNotifications(userId: number): Promise<Notification[]>
  // GET /users/{userId}/notifications
```

#### `hooks/useNotifications.ts`
```typescript
export function useNotifications(userId?: number)
  // Query: ["notifications", userId]
  // Enabled only if userId is defined
  // Conditional fetching pattern
```

#### `components/NotificationBell/NotificationBell.tsx`
- Bell icon with notification count badge
- Popover shows recent notifications
- Marks notifications as read
- Integrates with WebSocket for real-time updates

#### `types.ts`
```typescript
export type NotificationType = "Ticket" | "Message" | "Other";

export type Notification = {
  id: number;
  userId: number;
  type: string;
  payload: string;
  createdAt: string;
  read: boolean;
};

export type NotificationResponse = {
  message: string;
  data: Notification[];
};
```

### Key Pattern
- Conditional query enabling (only when userId exists)
- WebSocket pushes trigger query refetch
- Real-time notification count updates

---

## Feature Integration

### How Features Interact

1. **Auth → All Features**
   - Auth context provides user info
   - User ID used by notifications
   - Role determines available features

2. **Tickets → Notifications**
   - Ticket assignment triggers notification
   - New messages trigger notification
   - WebSocket coordinates both

3. **Employees → Auth**
   - Created employees can log in
   - Role determines feature access

### WebSocket Integration

All features receive real-time updates:
- **Auth**: Session validation
- **Tickets**: New tickets, assignments, messages
- **Employees**: User list updates (future)
- **Notifications**: Push notifications

### React Query Coordination

Query invalidation cascades across features:
```typescript
// Assigning ticket invalidates:
- ["tickets", "Open"]        // Admin ticket list
- ["myTickets", "Reviewing"] // Employee my tickets
- ["ticket", ticketId]       // Single ticket detail
- ["notifications", userId]  // User notifications (via WS)
```

---

## Adding New Features

To add a new feature, follow this structure:

1. Create `features/new-feature/` directory
2. Add `api/new-feature.ts` with API functions
3. Add `hooks/useNewFeature.ts` with React Query hooks
4. Add `components/` for UI
5. Add `types.ts` for TypeScript definitions
6. Add `index.ts` for barrel exports
7. Update WebSocket subscriptions if needed
8. Add invalidation logic to coordinate with other features

Example barrel export:
```typescript
// features/new-feature/index.ts
export * from './api/new-feature';
export * from './hooks/useNewFeature';
export * from './types';
export { default as NewFeatureComponent } from './components/NewFeatureComponent';
```
