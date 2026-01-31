# Shared Components (shared/)

## Overview

The `shared/` directory contains reusable UI components used across multiple features and pages.

```
shared/
└── components/
    ├── layout/
    │   ├── HeaderSimple/
    │   │   ├── HeaderSimple.tsx
    │   │   └── __tests__/
    │   │       └── HeaderSimple.test.tsx
    │   ├── NavbarSimple/
    │   │   └── NavbarSimple.tsx
    │   └── NavbarSegmented/
    │       └── NavbarSegmented.tsx
    ├── ui/
    │   └── BadgeCard/
    │       └── BadgeCard.tsx
    └── index.ts
```

---

## Layout Components

### HeaderSimple (`shared/components/layout/HeaderSimple/HeaderSimple.tsx`)

**Purpose:** Dashboard header with logo, navigation, and notifications

#### Features
- **Logo:** Easeport branding (left side)
- **Notification Bell:** Real-time notification count (right side)
- **Responsive:** Adapts to mobile/desktop

#### Props
```typescript
interface HeaderSimpleProps {
  // No props currently
}
```

#### Structure
```tsx
<Group justify="space-between" h="100%">
  {/* Logo */}
  <Group>
    <Logo />
    <Text size="lg" fw={700}>Easeport</Text>
  </Group>

  {/* Right side: Notifications */}
  <Group>
    <NotificationBell />
  </Group>
</Group>
```

#### Dependencies
- Mantine: `Group`, `Text`
- Logo component
- NotificationBell (from features/notifications)

#### Usage
```tsx
import { HeaderSimple } from '@/shared/components/layout/HeaderSimple';

<AppShell.Header>
  <HeaderSimple />
</AppShell.Header>
```

#### Test Coverage
- Located: `__tests__/HeaderSimple.test.tsx`
- Tests: Rendering, logo display, notification bell

---

### NavbarSimple (`shared/components/layout/NavbarSimple/NavbarSimple.tsx`)

**Purpose:** Navigation sidebar for Employee role (ROLE_USER)

#### Features
- **Navigation Links:**
  - All Tickets
  - My Tickets
- **Logout Button:** Bottom of sidebar
- **Active State:** Highlights current route

#### Props
```typescript
interface NavbarSimpleProps {
  // No props currently
}
```

#### Structure
```tsx
<Stack justify="space-between" h="100%">
  {/* Navigation Links */}
  <div>
    <NavLink
      href="/dashboard/employee/tickets"
      label="All Tickets"
      leftSection={<IconTicket />}
      active={pathname === '/dashboard/employee/tickets'}
    />
    <NavLink
      href="/dashboard/employee/my_tickets"
      label="My Tickets"
      leftSection={<IconUser />}
      active={pathname === '/dashboard/employee/my_tickets'}
    />
  </div>

  {/* Logout Button */}
  <Button onClick={handleLogout} color="red">
    Logout
  </Button>
</Stack>
```

#### Dependencies
- Mantine: `Stack`, `NavLink`, `Button`
- Next.js: `usePathname`, `useRouter`
- Icons: `@tabler/icons-react`
- Auth: `useAuthContext`
- WebSocket: `wsClient`

#### Logout Flow
```typescript
const handleLogout = async () => {
  await logout(); // API call
  wsClient.disconnect(); // Close WebSocket
  router.push('/login'); // Redirect
};
```

#### Usage
```tsx
import { NavbarSimple } from '@/shared/components/layout/NavbarSimple';

<AppShell.Navbar>
  <NavbarSimple />
</AppShell.Navbar>
```

---

### NavbarSegmented (`shared/components/layout/NavbarSegmented/NavbarSegmented.tsx`)

**Purpose:** Navigation sidebar for Admin role (ROLE_ADMIN)

#### Features
- **Navigation Links:**
  - Dashboard
  - Employees (Admin only)
  - All Tickets
  - My Tickets
- **Logout Button:** Bottom of sidebar
- **Active State:** Highlights current route
- **Extended Options:** More navigation than NavbarSimple

#### Props
```typescript
interface NavbarSegmentedProps {
  // No props currently
}
```

#### Structure
```tsx
<Stack justify="space-between" h="100%">
  {/* Navigation Links */}
  <div>
    <NavLink
      href="/dashboard"
      label="Dashboard"
      leftSection={<IconDashboard />}
      active={pathname === '/dashboard'}
    />
    <NavLink
      href="/dashboard/admin/employees"
      label="Employees"
      leftSection={<IconUsers />}
      active={pathname === '/dashboard/admin/employees'}
    />
    <NavLink
      href="/dashboard/employee/tickets"
      label="All Tickets"
      leftSection={<IconTicket />}
      active={pathname === '/dashboard/employee/tickets'}
    />
    <NavLink
      href="/dashboard/employee/my_tickets"
      label="My Tickets"
      leftSection={<IconUser />}
      active={pathname === '/dashboard/employee/my_tickets'}
    />
  </div>

  {/* Logout Button */}
  <Button onClick={handleLogout} color="red">
    Logout
  </Button>
</Stack>
```

#### Differences from NavbarSimple
- Includes "Dashboard" link
- Includes "Employees" link (admin-only feature)
- Same logout behavior
- Same dependency stack

#### Usage
```tsx
import { NavbarSegmented } from '@/shared/components/layout/NavbarSegmented';

<AppShell.Navbar>
  <NavbarSegmented />
</AppShell.Navbar>
```

---

## UI Components

### BadgeCard (`shared/components/ui/BadgeCard/BadgeCard.tsx`)

**Purpose:** Feature showcase card for dashboard

#### Features
- **Title:** Feature name
- **Description:** Feature description
- **Icon:** Visual indicator
- **Badge:** Optional status badge
- **Clickable:** Optional onClick handler

#### Props
```typescript
interface BadgeCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  badge?: string;
  onClick?: () => void;
}
```

#### Structure
```tsx
<Card
  shadow="sm"
  padding="lg"
  radius="md"
  withBorder
  onClick={onClick}
  style={{ cursor: onClick ? 'pointer' : 'default' }}
>
  <Group justify="apart">
    <Group>
      {icon}
      <Text fw={500}>{title}</Text>
    </Group>
    {badge && <Badge>{badge}</Badge>}
  </Group>

  <Text size="sm" c="dimmed" mt="sm">
    {description}
  </Text>
</Card>
```

#### Dependencies
- Mantine: `Card`, `Group`, `Text`, `Badge`

#### Usage
```tsx
import { BadgeCard } from '@/shared/components/ui/BadgeCard';
import { IconMail } from '@tabler/icons-react';

<BadgeCard
  title="Email to Ticket"
  description="Automatically convert emails to support tickets"
  icon={<IconMail size={24} />}
  badge="New"
  onClick={() => console.log('Clicked')}
/>
```

#### Example (Dashboard)
```tsx
// app/dashboard/page.tsx
<SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
  <BadgeCard
    title="Email Integration"
    description="Convert emails to tickets automatically"
    icon={<IconMail size={24} />}
  />
  <BadgeCard
    title="Real-time Updates"
    description="Get instant notifications via WebSocket"
    icon={<IconBell size={24} />}
    badge="Live"
  />
  <BadgeCard
    title="Smart Assignment"
    description="AI-powered ticket routing"
    icon={<IconRobot size={24} />}
    badge="AI"
  />
  <BadgeCard
    title="Conversation Thread"
    description="Track full email conversation history"
    icon={<IconMessage size={24} />}
  />
</SimpleGrid>
```

---

## Barrel Exports

### `shared/index.ts`

```typescript
// Layout components
export { HeaderSimple } from './components/layout/HeaderSimple/HeaderSimple';
export { NavbarSimple } from './components/layout/NavbarSimple/NavbarSimple';
export { NavbarSegmented } from './components/layout/NavbarSegmented/NavbarSegmented';

// UI components
export { BadgeCard } from './components/ui/BadgeCard/BadgeCard';
```

#### Usage with Barrel
```typescript
import { HeaderSimple, NavbarSimple, BadgeCard } from '@/shared';
```

---

## Component Patterns

### 1. Layout Components
**Characteristics:**
- Full-height containers
- Sticky positioning
- Role-based rendering
- Navigation handling

**Example:**
```tsx
export function NavbarSimple() {
  const pathname = usePathname();

  return (
    <Stack h="100%">
      {/* Content */}
    </Stack>
  );
}
```

### 2. UI Components
**Characteristics:**
- Reusable cards/badges
- Accept props for customization
- No internal state (presentational)
- Mantine-based styling

**Example:**
```tsx
export function BadgeCard({ title, description, icon }: Props) {
  return (
    <Card>
      {/* Content */}
    </Card>
  );
}
```

---

## Styling Approach

### Mantine-based Styling
All components use Mantine's built-in props:
```tsx
<Card shadow="sm" padding="lg" radius="md" withBorder>
  <Text size="lg" fw={700} c="dimmed">
    {/* Content */}
  </Text>
</Card>
```

### Responsive Props
```tsx
<SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
  {/* Grid items */}
</SimpleGrid>
```

### Inline Styles (Minimal)
```tsx
<Card style={{ cursor: onClick ? 'pointer' : 'default' }}>
  {/* Content */}
</Card>
```

---

## Testing Strategy

### Unit Tests
Located in `__tests__/` subdirectories

**Example: HeaderSimple Test**
```typescript
import { render, screen } from '@testing-library/react';
import { HeaderSimple } from './HeaderSimple';

describe('HeaderSimple', () => {
  it('renders logo', () => {
    render(<HeaderSimple />);
    expect(screen.getByText('Easeport')).toBeInTheDocument();
  });

  it('renders notification bell', () => {
    render(<HeaderSimple />);
    expect(screen.getByRole('button', { name: /notifications/i })).toBeInTheDocument();
  });
});
```

---

## Future Enhancements

### Suggested Additional Components

**`LoadingSpinner`**
```tsx
export function LoadingSpinner({ size = 'md' }: Props) {
  return <Loader size={size} />;
}
```

**`ErrorMessage`**
```tsx
export function ErrorMessage({ error }: Props) {
  return (
    <Alert color="red" title="Error">
      {error}
    </Alert>
  );
}
```

**`EmptyState`**
```tsx
export function EmptyState({ title, description, icon }: Props) {
  return (
    <Center h={300}>
      <Stack align="center">
        {icon}
        <Text fw={500}>{title}</Text>
        <Text c="dimmed">{description}</Text>
      </Stack>
    </Center>
  );
}
```

---

## Component Hierarchy

```
Dashboard Layout
├── HeaderSimple
│   ├── Logo
│   └── NotificationBell (from features/notifications)
├── NavbarSimple (ROLE_USER)
│   ├── NavLinks
│   └── Logout Button
└── NavbarSegmented (ROLE_ADMIN)
    ├── NavLinks (extended)
    └── Logout Button

Dashboard Home
├── BadgeCard (Email Integration)
├── BadgeCard (Real-time Updates)
├── BadgeCard (Smart Assignment)
└── BadgeCard (Conversation Thread)
```

---

## Best Practices

### 1. Keep Components Pure
```tsx
// Good: Presentational component
export function BadgeCard({ title, description }: Props) {
  return <Card>{/* ... */}</Card>;
}

// Bad: Component with side effects
export function BadgeCard() {
  const [data, setData] = useState();
  useEffect(() => { /* fetch data */ }, []);
}
```

### 2. Use Mantine Props
```tsx
// Good: Mantine props
<Text size="lg" fw={700} c="dimmed">

// Bad: Custom styles
<Text style={{ fontSize: 18, fontWeight: 700, color: '#666' }}>
```

### 3. Export Through Barrel
```tsx
// Good: Import from barrel
import { HeaderSimple } from '@/shared';

// Bad: Deep import
import { HeaderSimple } from '@/shared/components/layout/HeaderSimple/HeaderSimple';
```

### 4. Co-locate Tests
```
HeaderSimple/
├── HeaderSimple.tsx
└── __tests__/
    └── HeaderSimple.test.tsx
```

---

## Dependencies Summary

### Mantine Components Used
- `AppShell`
- `Card`
- `Group`
- `Stack`
- `Text`
- `Badge`
- `Button`
- `NavLink`
- `Loader`

### External Dependencies
- `@tabler/icons-react` - Icon library
- `next/navigation` - Router hooks
- React Query - State management (indirect)
