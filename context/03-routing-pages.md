# App Directory - Routing & Pages

## Next.js App Router Structure

The application uses Next.js 16 App Router with the following route hierarchy:

```
app/
├── layout.tsx                          # Root layout
├── page.tsx                            # Root page (/)
├── providers.tsx                       # Client providers wrapper
├── login/
│   └── page.tsx                        # Login page (/login)
└── dashboard/
    ├── layout.tsx                      # Dashboard shell
    ├── page.tsx                        # Dashboard home (/dashboard)
    ├── admin/
    │   ├── layout.tsx                  # Admin role guard
    │   ├── page.tsx                    # Admin home (/dashboard/admin)
    │   └── employees/
    │       └── page.tsx                # Employee management (/dashboard/admin/employees)
    └── employee/
        ├── layout.tsx                  # Employee role guard
        ├── page.tsx                    # Employee home (/dashboard/employee)
        ├── tickets/
        │   ├── page.tsx                # All tickets (/dashboard/employee/tickets)
        │   └── [ticketId]/
        │       └── page.tsx            # Ticket detail (/dashboard/employee/tickets/[id])
        └── my_tickets/
            └── page.tsx                # My tickets (/dashboard/employee/my_tickets)
```

---

## Route Details

### Root Routes

#### `/` - Root Page (`app/page.tsx`)
**Purpose:** Entry point, redirects to appropriate page

**Logic:**
```typescript
- If user is authenticated → redirect to /dashboard
- If not authenticated → redirect to /login
```

**Features:**
- Uses useAuth hook
- Client-side navigation
- Shows loading state during auth check

---

#### `/login` - Login Page (`app/login/page.tsx`)
**Purpose:** User authentication

**Components:**
- AuthenticationImage (login form)
- Branding/logo
- Error handling

**Flow:**
1. User enters credentials
2. Form validation
3. POST /auth/signin
4. On success → redirect to /dashboard
5. On error → show error message

**Metadata:**
```typescript
export const metadata = {
  title: 'Login - Easeport',
  description: 'Login to access the ticket management system'
}
```

---

### Dashboard Routes (Protected)

All `/dashboard/*` routes require authentication (enforced by middleware)

#### `/dashboard` - Dashboard Home (`app/dashboard/page.tsx`)
**Purpose:** Landing page after login, feature showcase

**Content:**
- Welcome message
- Feature cards (BadgeCard components)
- Role-based navigation suggestions

**Features Displayed:**
- Email-to-Ticket Conversion
- Real-time Notifications
- Smart Assignment
- Conversation Threading

---

#### `/dashboard/layout.tsx` - Dashboard Shell
**Purpose:** Shared layout for all dashboard pages

**Structure:**
```tsx
<AppShell>
  <AppShell.Header>
    <HeaderSimple /> {/* Logo, nav, notifications */}
  </AppShell.Header>

  <AppShell.Navbar>
    {role === "ROLE_ADMIN" && <NavbarSegmented />}
    {role === "ROLE_USER" && <NavbarSimple />}
  </AppShell.Navbar>

  <AppShell.Main>
    {children}
  </AppShell.Main>
</AppShell>
```

**Features:**
- Mantine AppShell responsive layout
- Role-based sidebar rendering
- WebSocket subscription initialization
- Logout functionality

**Hooks Used:**
- useAuthContext() - Get user info
- useDashboardWsSubscriptions() - Real-time updates
- useRouter() - Navigation

---

### Admin Routes (ROLE_ADMIN only)

#### `/dashboard/admin` - Admin Home (`app/dashboard/admin/page.tsx`)
**Purpose:** Admin landing page (placeholder)

**Current State:** Minimal content, redirects to /employees

---

#### `/dashboard/admin/layout.tsx` - Admin Guard
**Purpose:** Enforce ROLE_ADMIN access

**Logic:**
```typescript
if (user.role !== "ROLE_ADMIN") {
  redirect to /dashboard
}
```

---

#### `/dashboard/admin/employees` - Employee Management
**File:** `app/dashboard/admin/employees/page.tsx`

**Purpose:** CRUD interface for managing system users

**Components:**
- UsersTable (from features/employees)
- AddEmployeeForm modal
- UpdateEmployeeForm modal

**Features:**
- List all employees
- Create new employee
- Edit employee details
- Delete employee (UI only)

**Hooks:**
- useEmployees() - Fetch employee list
- useCreateEmployee() - Add mutation
- useUpdateEmployee() - Edit mutation
- useDeleteEmployee() - Delete mutation

**State:**
- Modal open/close state
- Selected employee for editing

---

### Employee Routes (ROLE_USER or ROLE_ADMIN)

#### `/dashboard/employee` - Employee Home
**File:** `app/dashboard/employee/page.tsx`

**Purpose:** Employee landing page (placeholder)

**Current State:** Minimal content, navigation suggestions

---

#### `/dashboard/employee/layout.tsx` - Employee Guard
**Purpose:** Enforce ROLE_USER or ROLE_ADMIN access

**Logic:**
```typescript
if (user.role !== "ROLE_USER" && user.role !== "ROLE_ADMIN") {
  redirect to /login
}
```

---

#### `/dashboard/employee/tickets` - All Tickets
**File:** `app/dashboard/employee/tickets/page.tsx`

**Purpose:** View and manage open tickets

**UI Elements:**
- Status tabs: Open | Reviewing | Closed
- TicketsTable component
- Click ticket → navigate to detail page

**Hooks:**
```typescript
useTicketsByStatus(selectedStatus)
// Fetches tickets based on selected tab
```

**Features:**
- Tab-based filtering
- Responsive table/card view
- Real-time updates via WebSocket
- Click to view details

**Query Keys:**
```typescript
["tickets", "Open"]
["tickets", "Reviewing"]
["tickets", "Closed"]
```

---

#### `/dashboard/employee/tickets/[ticketId]` - Ticket Detail
**File:** `app/dashboard/employee/tickets/[ticketId]/page.tsx`

**Purpose:** View and respond to specific ticket

**Dynamic Route:**
- URL param: `ticketId`
- Type: number

**Components:**
- TicketHeader
- TicketDescription
- TicketMetadata
- TicketSidebar (actions)
- ConversationPanel
- ReplyForm

**Features:**
- View ticket details
- View conversation thread
- Assign ticket to self
- Draft response (setAnswer)
- Send response (sendAnswer)
- Reply to specific message
- Close ticket
- Real-time message updates

**Hooks:**
```typescript
useTicketById(ticketId)
useConversationById(ticketId)
useAssignTicket()
useSetAnswer()
useSendAnswer()
useCloseTicket()
```

**Query Keys:**
```typescript
["ticket", ticketId]
["conversation", ticketId]
```

**WebSocket Topics:**
```typescript
/user/queue/ticket-messages  // New messages for this ticket
```

---

#### `/dashboard/employee/my_tickets` - My Tickets
**File:** `app/dashboard/employee/my_tickets/page.tsx`

**Purpose:** View tickets assigned to current user

**UI Elements:**
- Status tabs: Reviewing | Closed
- TicketsTable component
- Click ticket → navigate to detail page

**Hooks:**
```typescript
useMyTickets(selectedStatus)
// Fetches only tickets assigned to current user
```

**Differences from All Tickets:**
- Uses different API endpoint (/employeeTickets)
- No "Open" tab (unassigned tickets)
- Only shows user's assigned tickets

**Query Keys:**
```typescript
["myTickets", "Reviewing"]
["myTickets", "Closed"]
```

---

## Layout Hierarchy

```
Root Layout (layout.tsx)
├─ ReactQueryProvider
├─ AuthProvider
└─ Providers (WebSocket)
    │
    ├─ Login Page (public)
    │
    └─ Dashboard Layout (protected)
        ├─ Admin Layout (ROLE_ADMIN only)
        │   └─ Admin Pages
        │
        └─ Employee Layout (ROLE_USER/ROLE_ADMIN)
            └─ Employee Pages
```

---

## Route Protection

### Middleware (`middleware.ts`)
Protects routes at the edge:
- Checks role cookie
- Blocks /dashboard/admin/* for non-admins
- Blocks /dashboard/employee/* for non-users
- Redirects unauthenticated users

### Layout Guards
Additional client-side checks:
- Admin layout checks ROLE_ADMIN
- Employee layout checks ROLE_USER or ROLE_ADMIN
- Redirects if role doesn't match

---

## Navigation Patterns

### Programmatic Navigation
```typescript
import { useRouter } from 'next/navigation';

const router = useRouter();
router.push('/dashboard/employee/tickets');
```

### Link Components
```typescript
import Link from 'next/link';

<Link href={`/dashboard/employee/tickets/${ticketId}`}>
  View Ticket
</Link>
```

### NavLink (Mantine)
Used in sidebar navigation:
```typescript
<NavLink
  href="/dashboard/employee/tickets"
  label="All Tickets"
  active={pathname === '/dashboard/employee/tickets'}
/>
```

---

## Page Metadata

Each page can export metadata:
```typescript
export const metadata: Metadata = {
  title: 'Page Title - Easeport',
  description: 'Page description'
};
```

---

## Loading & Error States

### Loading States
Handled by React Query:
```typescript
const { data, isLoading, error } = useTickets();

if (isLoading) return <Loader />;
if (error) return <Error message={error.message} />;
```

### Error Boundaries
Next.js provides automatic error boundaries for:
- error.tsx (recoverable errors)
- global-error.tsx (unrecoverable errors)

Currently not implemented (future enhancement)

---

## Query Parameter Patterns

### Status Filtering
```typescript
// URL: /tickets?status=Open
const searchParams = useSearchParams();
const status = searchParams.get('status') || 'Open';
```

### Dynamic Routes
```typescript
// URL: /tickets/123
export default function Page({ params }: { params: { ticketId: string } }) {
  const ticketId = parseInt(params.ticketId);
}
```

---

## Page-Specific Context

### Dashboard Pages
- Have access to WebSocket subscriptions
- Use dashboard-wide layouts
- Share HeaderSimple and Navbar

### Public Pages
- No WebSocket connection
- No auth state (or loading state)
- Minimal layout

---

## Responsive Behavior

All dashboard pages are responsive:
- **Desktop**: Sidebar visible, table view
- **Tablet**: Collapsible sidebar, table view
- **Mobile**: Hidden sidebar (burger menu), card view

Breakpoints (Mantine):
- xs: 0-575px
- sm: 576-767px
- md: 768-991px
- lg: 992-1199px
- xl: 1200px+
